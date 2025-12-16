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

// --- ENDPOINT POUR LES CARTES HEARTHSTONE ---
// Cache pour les cartes (1 heure)
let cardsCache = { timestamp: 0, data: null, includeNonCollectible: false };

app.get('/api/hearthstone/cards', async (req, res) => {
    const now = Date.now();
    const includeNonCollectible = req.query.includeNonCollectible === 'true';

    // Si le cache est valide (moins d'1 heure) ET que le mode correspond, on l'utilise
    if (cardsCache.data &&
        (now - cardsCache.timestamp < 3600000) &&
        cardsCache.includeNonCollectible === includeNonCollectible) {
        console.log(`✅ Cartes servies depuis le cache (mode: ${includeNonCollectible ? 'toutes' : 'collectibles'})`);
        res.setHeader('Content-Type', 'application/json');
        return res.json(cardsCache.data);
    }

    if (cardsCache.data && cardsCache.includeNonCollectible !== includeNonCollectible) {
        console.log(`🔄 Changement de mode détecté (${cardsCache.includeNonCollectible ? 'toutes' : 'collectibles'} -> ${includeNonCollectible ? 'toutes' : 'collectibles'}), rechargement...`);
    }

    try {
        console.log("🔄 Récupération des cartes depuis HearthstoneJSON...");
        console.log("URL:", 'https://api.hearthstonejson.com/v1/latest/frFR/cards.json');

        const response = await axios.get('https://api.hearthstonejson.com/v1/latest/frFR/cards.json', {
            timeout: 30000, // Augmenté à 30 secondes
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        console.log(`📦 Réponse reçue - Status: ${response.status}`);
        console.log(`📦 Type de données: ${typeof response.data}`);
        console.log(`📦 Est un tableau: ${Array.isArray(response.data)}`);

        if (Array.isArray(response.data) && response.data.length > 0) {
            console.log(`📦 Nombre de cartes total: ${response.data.length}`);

            // Filtrer selon le paramètre includeNonCollectible
            let filteredCards;
            if (includeNonCollectible) {
                // Inclure toutes les cartes qui ont un nom
                filteredCards = response.data.filter(card =>
                    card.name && card.name.trim().length > 0
                );
                console.log(`📦 Toutes les cartes (avec nom): ${filteredCards.length}`);
            } else {
                // Ne garder que les cartes collectibles
                filteredCards = response.data.filter(card =>
                    card.collectible === true
                );
                console.log(`📦 Cartes collectibles: ${filteredCards.length}`);
            }

            console.log(`📦 Exemple de carte:`, JSON.stringify(filteredCards[0], null, 2).substring(0, 200));

            // Mise à jour du cache avec les cartes filtrées et le mode
            cardsCache = { timestamp: now, data: filteredCards, includeNonCollectible };
            console.log(`✅ ${filteredCards.length} cartes mises en cache (mode: ${includeNonCollectible ? 'toutes' : 'collectibles'})`);

            // S'assurer que le Content-Type est correct
            res.setHeader('Content-Type', 'application/json');
            res.json(filteredCards);
        } else {
            console.error("❌ Les données reçues ne sont pas un tableau valide");
            console.log("Données reçues:", JSON.stringify(response.data).substring(0, 500));
            res.status(500).json({ error: "Format de données invalide" });
        }

    } catch (error) {
        console.error("❌ ERREUR API CARTES:");
        console.error("  Message:", error.message);
        console.error("  Code:", error.code);
        if (error.response) {
            console.error("  Status:", error.response.status);
            console.error("  Data:", JSON.stringify(error.response.data).substring(0, 200));
            res.status(error.response.status).json({ error: "Erreur lors de la récupération des cartes", details: error.message });
        } else {
            res.status(500).json({ error: "Erreur interne serveur", details: error.message });
        }
    }
});

app.listen(PORT, () => console.log(`🚀 Serveur PRET sur le port ${PORT}`));