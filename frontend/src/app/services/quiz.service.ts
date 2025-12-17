import { Injectable } from '@angular/core';
import { Card, HiddenAttribute, QuizQuestion, HIDDEN_ATTRIBUTE_LABELS } from '../models/card.model';
import { CardService } from './card.service';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private previousCardId: string | null = null;

  /**
   * Selects a random card from the list.
   * Avoids repeating the same card consecutively.
   */
  selectRandomCard(cards: Card[]): Card {
    if (cards.length === 0) {
      throw new Error('No cards available');
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
   * Resets the previous card history.
   */
  resetPreviousCard(): void {
    this.previousCardId = null;
  }

  /**
   * Creates a new quiz question.
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
   * Returns the label of an attribute to guess.
   */
  getAttributeLabel(attribute: HiddenAttribute): string {
    return HIDDEN_ATTRIBUTE_LABELS[attribute];
  }

  /**
   * Returns the placeholder for the answer field according to the attribute.
   */
  getAnswerPlaceholder(attribute: HiddenAttribute): string {
    switch (attribute) {
      case 'name':
        return 'Enter card name...';
      case 'cardClass':
        return 'Enter class (Mage, Warrior, Neutral...)';
      case 'cost':
        return 'Enter mana cost (0-10+)';
      case 'attack':
        return 'Enter attack';
      case 'health':
        return 'Enter health';
      case 'rarity':
        return 'Enter rarity (Common, Rare, Epic, Legendary)';
      case 'set':
        return 'Enter set (e.g.: Titans, Forged in the Barrens...)';
      default:
        return 'Enter your answer...';
    }
  }

  /**
   * Checks if the user's answer is correct.
   */
  checkAnswer(question: QuizQuestion, userAnswer: string): boolean {
    const correctValue = this.getAttributeValue(question.card, question.hiddenAttribute);
    const normalizedUserAnswer = this.normalizeString(userAnswer);
    const normalizedCorrectValue = this.normalizeString(correctValue);

    // For classes and rarities, also accept translations
    if (question.hiddenAttribute === 'cardClass') {
      const translatedClass = question.card.cardClass;
      if (normalizedUserAnswer === this.normalizeString(translatedClass)) {
        return true;
      }
    }

    if (question.hiddenAttribute === 'rarity' && question.card.rarity) {
      const translatedRarity = question.card.rarity;
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
   * Retrieves the value of a card attribute (translated if necessary).
   */
  getAttributeValue(card: Card, attribute: HiddenAttribute): string {
    switch (attribute) {
      case 'name':
        return card.name;
      case 'cardClass':
        return card.cardClass;
      case 'cost':
        return card.cost?.toString() ?? '0';
      case 'attack':
        return card.attack?.toString() ?? '0';
      case 'health':
        return card.health?.toString() ?? '0';
      case 'rarity':
        return card.rarity ?? '';
      case 'set':
        return card.set;
      default:
        return '';
    }
  }

  /**
   * Normalizes a string for comparison:
   * - Converts to lowercase.
   * - Removes accents.
   * - Removes special characters and multiple spaces.
   */
  normalizeString(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Removes accents
      .replace(/['']/g, ' ')           // Replaces apostrophes with spaces
      .replace(/[^a-z0-9\s]/g, '')     // Keeps only letters, numbers, spaces
      .replace(/\s+/g, ' ')            // Normalizes spaces
      .trim();
  }
}
