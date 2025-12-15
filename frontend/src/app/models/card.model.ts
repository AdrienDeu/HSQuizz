/**
 * Interface représentant une carte Hearthstone
 * Basée sur le format de l'API HearthstoneJSON
 */
export interface Card {
  id: string;
  dbfId: number;
  name: string;
  cardClass: string;
  type: string;
  rarity?: string;
  cost?: number;
  attack?: number;
  health?: number;
  durability?: number; // Pour les armes
  text?: string;
  flavor?: string;
  set: string;
  race?: string;
  races?: string[];
  mechanics?: string[];
  collectible?: boolean;
  elite?: boolean; // Légendaire
  artist?: string;
  spellSchool?: string;
}

/**
 * Type des attributs masquables dans le quiz
 */
export type HiddenAttribute = 'name' | 'cardClass' | 'cost' | 'attack' | 'health' | 'rarity';

/**
 * État d'une question de quiz
 */
export interface QuizQuestion {
  card: Card;
  hiddenAttribute: HiddenAttribute;
  answered: boolean;
  correct: boolean | null;
  userAnswer: string;
  revealed: boolean;
}
