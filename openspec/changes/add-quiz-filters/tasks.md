# Tasks: Ajouter des filtres de quiz

## 1. Modèles et types
- [x] 1.1 Ajouter le type `QuizSettings` avec les options de configuration
- [x] 1.2 Ajouter une map des extensions avec leurs noms traduits en français
- [x] 1.3 Ajouter le type pour les attributs devinables

## 2. Service de cartes
- [x] 2.1 Ajouter une méthode pour récupérer la liste des extensions disponibles
- [x] 2.2 Ajouter une méthode pour filtrer les cartes par extension(s)
- [x] 2.3 Ajouter les traductions des noms d'extensions en français

## 3. Service de quiz
- [x] 3.1 Mettre à jour `createQuestion` pour accepter n'importe quel attribut devinable
- [x] 3.2 Ajouter une méthode pour obtenir le label de l'attribut à deviner

## 4. Interface utilisateur
- [x] 4.1 Créer un panneau de configuration du quiz avec:
  - Sélecteur multi-choix pour les extensions
  - Sélecteur pour l'attribut à deviner
- [x] 4.2 Ajouter un bouton "Démarrer le quiz" après configuration
- [x] 4.3 Afficher le mode de jeu actuel (extension + attribut) pendant le quiz
- [x] 4.4 Ajouter un bouton pour revenir aux paramètres

## 5. Intégration
- [x] 5.1 Connecter les filtres au chargement des cartes
- [x] 5.2 Mettre à jour la logique de génération de questions
- [x] 5.3 Adapter l'affichage de la carte selon l'attribut caché

## 6. Tests et validation
- [x] 6.1 Tester le filtrage par extension (compilation réussie)
- [x] 6.2 Tester tous les attributs devinables (compilation réussie)
- [x] 6.3 Vérifier l'UX sur mobile (styles responsive ajoutés)
