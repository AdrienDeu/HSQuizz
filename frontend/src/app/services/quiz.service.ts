import { Injectable } from '@angular/core';
import { Card, HiddenAttribute, QuizQuestion, HIDDEN_ATTRIBUTE_LABELS } from '../models/card.model';
import { CardService } from './card.service';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private previousCardId: string | null = null;

  /**
   * Sélectionne une carte aléatoire parmi la liste
   * Évite de répéter la même carte consécutivement
   */
  selectRandomCard(cards: Card[]): Card {
    if (cards.length === 0) {
      throw new Error('Aucune carte disponible');
    }

    if (cards.length === 1) {
      return cards[0];
    }

    let selectedCard: Card;
    do {
      const randomIndex = Math.floor(Math.random() * cards.length);
      selectedCard = cards[randomIndex];
    } while (selectedCard.id === this.previousCardId);

    this.previousCardId = selectedCard.id;
    return selectedCard;
  }

  /**
   * Réinitialise l'historique de carte précédente
   */
  resetPreviousCard(): void {
    this.previousCardId = null;
  }

  /**
   * Crée une nouvelle question de quiz
   */
  createQuestion(card: Card, hiddenAttribute: HiddenAttribute = 'name'): QuizQuestion {
    return {
      card,
      hiddenAttribute,
      answered: false,
      correct: null,
      userAnswer: '',
      revealed: false
    };
  }

  /**
   * Retourne le label d'un attribut à deviner
   */
  getAttributeLabel(attribute: HiddenAttribute): string {
    return HIDDEN_ATTRIBUTE_LABELS[attribute];
  }

  /**
   * Retourne le placeholder pour le champ de réponse selon l'attribut
   */
  getAnswerPlaceholder(attribute: HiddenAttribute): string {
    switch (attribute) {
      case 'name':
        return 'Entrez le nom de la carte...';
      case 'cardClass':
        return 'Entrez la classe (Mage, Guerrier, Neutre...)';
      case 'cost':
        return 'Entrez le coût en mana (0-10+)';
      case 'attack':
        return 'Entrez l\'attaque';
      case 'health':
        return 'Entrez les points de vie';
      case 'rarity':
        return 'Entrez la rareté (Commune, Rare, Épique, Légendaire)';
      case 'set':
        return 'Entrez l\'extension (ex: Les Titans, Forgés dans les Tarides...)';
      default:
        return 'Entrez votre réponse...';
    }
  }

  /**
   * Vérifie si la réponse de l'utilisateur est correcte
   */
  checkAnswer(question: QuizQuestion, userAnswer: string): boolean {
    const correctValue = this.getAttributeValue(question.card, question.hiddenAttribute);
    const normalizedUserAnswer = this.normalizeString(userAnswer);
    const normalizedCorrectValue = this.normalizeString(correctValue);

    // Pour les classes et raretés, accepter aussi les traductions
    if (question.hiddenAttribute === 'cardClass') {
      const translatedClass = CardService.translateClass(question.card.cardClass);
      if (normalizedUserAnswer === this.normalizeString(translatedClass)) {
        return true;
      }
    }

    if (question.hiddenAttribute === 'rarity' && question.card.rarity) {
      const translatedRarity = CardService.translateRarity(question.card.rarity);
      if (normalizedUserAnswer === this.normalizeString(translatedRarity)) {
        return true;
      }
    }

    // Pour les extensions, accepter le code original ET la traduction
    if (question.hiddenAttribute === 'set') {
      const setCode = question.card.set;
      if (normalizedUserAnswer === this.normalizeString(setCode)) {
        return true;
      }
    }

    return normalizedUserAnswer === normalizedCorrectValue;
  }

  /**
   * Récupère la valeur d'un attribut de la carte (traduite si nécessaire)
   */
  getAttributeValue(card: Card, attribute: HiddenAttribute): string {
    switch (attribute) {
      case 'name':
        return card.name;
      case 'cardClass':
        return CardService.translateClass(card.cardClass);
      case 'cost':
        return card.cost?.toString() ?? '0';
      case 'attack':
        return card.attack?.toString() ?? '0';
      case 'health':
        return card.health?.toString() ?? '0';
      case 'rarity':
        return CardService.translateRarity(card.rarity ?? '');
      case 'set':
        return CardService.translateSet(card.set);
      default:
        return '';
    }
  }

  /**
   * Normalise une chaîne pour la comparaison
   * - Convertit en minuscules
   * - Supprime les accents
   * - Supprime les caractères spéciaux et espaces multiples
   */
  normalizeString(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
      .replace(/['']/g, ' ')           // Remplace apostrophes par espaces
      .replace(/[^a-z0-9\s]/g, '')     // Garde uniquement lettres, chiffres, espaces
      .replace(/\s+/g, ' ')            // Normalise les espaces
      .trim();
  }
}
