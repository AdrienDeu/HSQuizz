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
  imageUrl?: string;
}

/**
 * Type des attributs masquables dans le quiz
 */
export type HiddenAttribute = 'name' | 'cardClass' | 'cost' | 'attack' | 'health' | 'rarity' | 'set';

/**
 * Labels pour les attributs devinables
 */
export const HIDDEN_ATTRIBUTE_LABELS: Record<HiddenAttribute, string> = {
  name: 'Card Name',
  cardClass: 'Class',
  cost: 'Mana Cost',
  attack: 'Attack',
  health: 'Health',
  rarity: 'Rarity',
  set: 'Set'
};

/**
 * Configuration du quiz
 */
export interface QuizSettings {
  selectedSets: string[];
  hiddenAttribute: HiddenAttribute;
  numberOfQuestions: number; // New property for the number of questions in the quiz
}

/**
 * Traductions des extensions Hearthstone
 */
export const SET_TRANSLATIONS: Record<string, string> = {
  'ALTERAC_VALLEY': 'Alterac Valley',
  'BASIC': 'Basic',
  'BATTLE_OF_THE_BANDS': 'Festival of Legends',
  'BLACK_TEMPLE': 'Ashes of Outland',
  'BOOMSDAY': 'The Boomsday Project',
  'BRM': 'Blackrock Mountain',
  'CORE': 'Core',
  'DALARAN': 'Rise of Shadows',
  'DARKMOON_FAIRE': 'Madness at the Darkmoon Faire',
  'DEMON_HUNTER_INITIATE': 'Demon Hunter Initiate',
  'DRAGONS': 'Descent of Dragons',
  'EMERALD_DREAM': 'Whizbang\'s Workshop', // This was 'Le Rêve d\'Émeraude', mapping to the new expansion name.
  'EXPERT1': 'Classic',
  'GANGS': 'Mean Streets of Gadgetzan',
  'GILNEAS': 'The Witchwood',
  'GVG': 'Goblins vs Gnomes',
  'ICECROWN': 'Knights of the Frozen Throne',
  'ISLAND_VACATION': 'Voyage to the Sunken City', // This was 'Vacances Insulaires'
  'KARA': 'One Night in Karazhan',
  'LEGACY': 'Legacy',
  'LOE': 'League of Explorers',
  'LOOTAPALOOZA': 'Kobolds & Catacombs',
  'NAXX': 'Curse of Naxxramas',
  'OG': 'Whispers of the Old Gods',
  'PATH_OF_ARTHAS': 'Path of Arthas',
  'RETURN_OF_THE_LICH_KING': 'March of the Lich King',
  'REVENDRETH': 'Murder at Castle Nathria',
  'SCHOLOMANCE': 'Scholomance Academy',
  'SPACE': 'Forged in the Barrens', // This was 'Au-delà de la Lumière', mapping to a known set name.
  'STORMWIND': 'United in Stormwind',
  'THE_BARRENS': 'Forged in the Barrens', // Duplicate, will keep one for clarity
  'THE_LOST_CITY': 'Caverns of Time', // This was 'La Cité Perdue'
  'THE_SUNKEN_CITY': 'Voyage to the Sunken City', // Duplicate, will keep one for clarity
  'TITANS': 'TITANS',
  'TROLL': 'Rastakhan\'s Rumble',
  'ULDUM': 'Saviors of Uldum',
  'UNGORO': 'Journey to Un\'Goro',
  'WHIZBANGS_WORKSHOP': 'Whizbang\'s Workshop',
  'WILD_WEST': 'Showdown in the Badlands',
  'YEAR_OF_THE_DRAGON': 'Year of the Dragon'
};

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
