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
  durability?: number; 
  text?: string;
  flavor?: string;
  set: string;
  race?: string;
  races?: string[];
  mechanics?: string[];
  collectible?: boolean;
  elite?: boolean;
  artist?: string;
  spellSchool?: string;
}

export type HiddenAttribute = 'name' | 'cardClass' | 'cost' | 'attack' | 'health' | 'rarity' | 'set';

export interface QuizSettings {
  selectedSets: string[];
  hiddenAttribute: HiddenAttribute;
}

export interface QuizQuestion {
  card: Card;
  hiddenAttribute: HiddenAttribute;
  answered: boolean;
  correct: boolean | null;
  userAnswer: string;
  revealed: boolean;
}
