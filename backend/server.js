// --- VACCIN RÉSEAU ---
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

// Client HTTP (Imite un navigateur)
const webClient = axios.create({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://hearthstone.blizzard.com/fr-fr/community/leaderboards',
        'Accept': 'application/json'
    }
});

async function getLatestSeasonId(mode, region) {
    try {
        console.log("🔄 Récupération des informations de saison...");
        const response = await webClient.get('https://hearthstone.blizzard.com/fr-fr/api/community/leaderboards');
        return findSeasonInMetadata(response.data, mode, region);
    } catch (e) {
        console.error("⚠️ Erreur lors de la récupération des saisons.");
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
    // La "page" du frontend correspond à un bloc de 100 joueurs.
    const frontendPage = parseInt(req.query.page || '1', 10);

    console.log(`\n▶️ [LEADERBOARD] Requête reçue pour ${mode} (${region}), bloc de page ${frontendPage}.`);

    try {
        const seasonId = await getLatestSeasonId(mode, region);
        if (seasonId) {
            console.log(`   - ID de saison trouvé: ${seasonId}`);
        } else {
            console.log(`   - ⚠️ Impossible de trouver un ID de saison, l'API pourrait échouer.`);
        }

        // On va chercher 4 pages de 25 joueurs pour en avoir 100.
        const pagesToFetch = [
            (frontendPage - 1) * 4 + 1,
            (frontendPage - 1) * 4 + 2,
            (frontendPage - 1) * 4 + 3,
            (frontendPage - 1) * 4 + 4,
        ];
        
        console.log(`   - 📞 Préparation des appels parallèles pour les pages Blizzard: ${pagesToFetch.join(', ')}`);

        // Créer un tableau de promesses pour les appels parallèles
        const requests = pagesToFetch.map(page => {
            const params = { region, leaderboardId: mode, page };
            if (seasonId) params.seasonId = seasonId;
            const targetUrl = `https://hearthstone.blizzard.com/fr-fr/api/community/leaderboardsData`;
            return webClient.get(targetUrl, { params });
        });

        // Exécuter les requêtes en parallèle
        const responses = await Promise.all(requests);

        // Agréger et re-classer les résultats
        let allRows = [];
        let rankCounter = (frontendPage - 1) * 100;
        for (const response of responses) {
            const rows = response.data.leaderboard ? response.data.leaderboard.rows : [];
            for (const row of rows) {
                // On recalcule le rang pour qu'il soit continu
                rankCounter++;
                allRows.push({ ...row, rank: rankCounter });
            }
        }

        console.log(`   - ✅ Succès ! ${allRows.length} joueurs reçus et re-classés au total.`);

        // On doit re-créer l'objet réponse pour qu'il soit cohérent
        const finalResponse = {
            leaderboard: {
                // On garde les métadonnées de la première réponse
                ...(responses[0].data.leaderboard || {}),
                rows: allRows
            },
            // On peut ajouter des métadonnées sur la pagination si besoin
            pagination: {
                frontendPage: frontendPage,
                blizzardPages: pagesToFetch
            }
        };

        res.json(finalResponse);

    } catch (error) {
        console.error("   - ❌ [LEADERBOARD] ERREUR lors des appels parallèles à l'API Blizzard.");
        if (error.response) {
            console.error(`     - Status: ${error.response.status}`);
            console.error(`     - Data: ${JSON.stringify(error.response.data)}`);
            res.status(error.response.status).json(error.response.data);
        } else {
            console.error(`     - Message: ${error.message}`);
            res.status(500).json({ error: "Erreur interne du serveur lors de la communication avec l'API Blizzard" });
        }
    }
});

app.get('/api/hearthstone/cards', async (req, res) => {
    const includeNonCollectible = req.query.includeNonCollectible === 'true';

    try {
        console.log(`🔄 Récupération des cartes depuis HearthstoneJSON (mode: ${includeNonCollectible ? 'toutes' : 'collectibles'})...`);

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
            
            console.log(`✅ ${filteredCards.length} cartes récupérées et filtrées.`);
            res.setHeader('Content-Type', 'application/json');
            res.json(filteredCards);
        } else {
            console.error("❌ Les données reçues de HearthstoneJSON ne sont pas un tableau valide.");
            res.status(500).json({ error: "Format de données invalide depuis l'API de cartes" });
        }

    } catch (error) {
        console.error("❌ ERREUR API CARTES:", error.message);
        res.status(500).json({ error: "Erreur interne serveur lors de la récupération des cartes", details: error.message });
    }
});

app.listen(PORT);