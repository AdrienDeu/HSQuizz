delete process.env.HTTP_PROXY;
delete process.env.HTTPS_PROXY;
delete process.env.http_proxy;
delete process.env.https_proxy;

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
const PORT = 3000;

const webClient = axios.create({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://hearthstone.blizzard.com/fr-fr/community/leaderboards',
        'Accept': 'application/json'
    }
});

async function getLatestSeasonId(mode, region) {
    try {
        const response = await webClient.get('https://hearthstone.blizzard.com/fr-fr/api/community/leaderboards');
        return findSeasonInMetadata(response.data, mode, region);
    } catch (e) {
        return null;
    }
}

function findSeasonInMetadata(meta, mode, region) {
    if (!meta || !meta.leaderboards) return null;
    const targetMode = meta.leaderboards.find(m => m.id.toLowerCase() === mode.toLowerCase());
    if (!targetMode) return null;

    if (targetMode.seasons && targetMode.seasons.length > 0) {
        const sortedSeasons = targetMode.seasons.sort((a, b) => b.id - a.id);
        return sortedSeasons[0].id;
    }
    return null;
}

app.get('/api/blizzard/leaderboardsData', async (req, res) => {
    const mode = req.query.leaderboardId || 'standard';
    const region = (req.query.region || 'EU').toUpperCase();
    const frontendPage = parseInt(req.query.page || '1', 10);


    try {
        const seasonId = await getLatestSeasonId(mode, region);
        if (seasonId) {
        } else {
        }

        const pagesToFetch = [
            (frontendPage - 1) * 4 + 1,
            (frontendPage - 1) * 4 + 2,
            (frontendPage - 1) * 4 + 3,
            (frontendPage - 1) * 4 + 4,
        ];
        

        const requests = pagesToFetch.map(page => {
            const params = { region, leaderboardId: mode, page };
            if (seasonId) params.seasonId = seasonId;
            const targetUrl = `https://hearthstone.blizzard.com/fr-fr/api/community/leaderboardsData`;
            return webClient.get(targetUrl, { params });
        });

        const responses = await Promise.all(requests);

        let allRows = [];
        let rankCounter = (frontendPage - 1) * 100;
        for (const response of responses) {
            const rows = response.data.leaderboard ? response.data.leaderboard.rows : [];
            for (const row of rows) {
                rankCounter++;
                allRows.push({ ...row, rank: rankCounter });
            }
        }


        const finalResponse = {
            leaderboard: {
                ...(responses[0].data.leaderboard || {}),
                rows: allRows
            },
            pagination: {
                frontendPage: frontendPage,
                blizzardPages: pagesToFetch
            }
        };

        res.json(finalResponse);

    } catch (error) {
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: "Erreur interne du serveur lors de la communication avec l'API Blizzard" });
        }
    }
});

app.get('/api/hearthstone/cards', async (req, res) => {
    const includeNonCollectible = req.query.includeNonCollectible === 'true';

    try {

        const response = await axios.get('https://api.hearthstonejson.com/v1/latest/frFR/cards.json', {
            timeout: 30000,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        if (Array.isArray(response.data) && response.data.length > 0) {
            let filteredCards;
            if (includeNonCollectible) {
                filteredCards = response.data.filter(card => card.name && card.name.trim().length > 0);
            } else {
                filteredCards = response.data.filter(card => card.collectible === true);
            }
            
            res.setHeader('Content-Type', 'application/json');
            res.json(filteredCards);
        } else {
            res.status(500).json({ error: "Format de données invalide depuis l'API de cartes" });
        }

    } catch (error) {
        res.status(500).json({ error: "Erreur interne serveur lors de la récupération des cartes", details: error.message });
    }
});

app.listen(PORT);