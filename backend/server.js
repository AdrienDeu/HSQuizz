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

// Cache simple
let seasonsCache = { timestamp: 0, data: null };

async function getLatestSeasonId(mode, region) {
    const now = Date.now();
    if (seasonsCache.data && (now - seasonsCache.timestamp < 3600000)) {
        return findSeasonInMetadata(seasonsCache.data, mode, region);
    }
    try {
        console.log("🔄 Mise à jour du cache des saisons...");
        const response = await webClient.get('https://hearthstone.blizzard.com/fr-fr/api/community/leaderboards');
        seasonsCache = { timestamp: now, data: response.data };
        return findSeasonInMetadata(response.data, mode, region);
    } catch (e) {
        console.error("⚠️ Erreur cache saisons.");
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

// --- LA CORRECTION EST ICI ---
// On écoute exactement l'URL demandée par votre message d'erreur
app.get('/api/blizzard/leaderboardsData', async (req, res) => {

    // Angular envoie les infos dans les paramètres (ex: ?leaderboardId=standard)
    const mode = req.query.leaderboardId || 'standard';
    const region = (req.query.region || 'EU').toUpperCase();
    const page = req.query.page || 1;

    console.log(`\n>>> REQUÊTE REÇUE : ${mode} (${region}) - Page ${page}`);

    try {
        const seasonId = await getLatestSeasonId(mode, region);

        const params = {
            region: region,
            leaderboardId: mode,
            page: page
        };
        // On injecte la saison trouvée automatiquement
        if (seasonId) params.seasonId = seasonId;

        const response = await webClient.get('https://hearthstone.blizzard.com/fr-fr/api/community/leaderboardsData', { params });
        const rows = response.data.leaderboard ? response.data.leaderboard.rows : [];

        console.log(`✅ SUCCÈS : ${rows.length} joueurs envoyés au site.`);
        res.json(response.data);

    } catch (error) {
        console.error("❌ ERREUR API:", error.message);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: "Erreur interne serveur" });
        }
    }
});

app.listen(PORT, () => console.log(`🚀 Serveur PRET sur le port ${PORT}`));