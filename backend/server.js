// Votre fichier frontend (ex: script.js ou dans un composant React)

async function afficherLeaderboard() {
    try {
        const response = await fetch('http://localhost:3000/api/leaderboard');
        
        if (!response.ok) throw new Error('Erreur réseau');
        
        const data = await response.json();
        
        const joueurs = data.leaderboard.rows; 

        const listeHTML = document.getElementById('leaderboard-list');
        listeHTML.innerHTML = '';

        joueurs.forEach(joueur => {
            const li = document.createElement('li');
            li.textContent = `#${joueur.rank} - ${joueur.accountid} (Rating: ${joueur.rating})`;
            listeHTML.appendChild(li);
        });

    } catch (error) {
        console.error("Erreur:", error);
        alert("Impossible de charger le leaderboard.");
    }
}

afficherLeaderboard();