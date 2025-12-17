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
  'ALTERAC_VALLEY': 'Vallée d\'Alterac',
  'BASIC': 'Basique',
  'BATTLE_OF_THE_BANDS': 'La Bataille des Groupes',
  'BLACK_TEMPLE': 'Les Cendres de l\'Outreterre',
  'BOOMSDAY': 'Projet Armageboum',
  'BRM': 'Mont Rochenoire',
  'CORE': 'Cartes de base',
  'DALARAN': 'L\'Envol des Dragons',
  'DARKMOON_FAIRE': 'Foire de Sombrelune',
  'DEMON_HUNTER_INITIATE': 'Chasseur de démons - Initiation',
  'DRAGONS': 'Descente des Dragons',
  'EMERALD_DREAM': 'Le Rêve d\'Émeraude',
  'EXPERT1': 'Classique',
  'GANGS': 'Les Gadgetzans',
  'GILNEAS': 'Le Bois Maudit',
  'GVG': 'Gobelins et Gnomes',
  'ICECROWN': 'Chevaliers du Trône de Glace',
  'ISLAND_VACATION': 'Vacances Insulaires',
  'KARA': 'Une Nuit à Karazhan',
  'LEGACY': 'Héritage',
  'LOE': 'La Ligue des Explorateurs',
  'LOOTAPALOOZA': 'Kobolds et Catacombes',
  'NAXX': 'La Malédiction de Naxxramas',
  'OG': 'Les Murmures des Dieux Très Anciens',
  'PATH_OF_ARTHAS': 'La Voie d\'Arthas',
  'RETURN_OF_THE_LICH_KING': 'Le Retour du Roi-Liche',
  'REVENDRETH': 'Meurtre au Château Nathria',
  'SCHOLOMANCE': 'L\'Académie Scholomance',
  'SPACE': 'Au-delà de la Lumière',
  'STORMWIND': 'Unis à Hurlevent',
  'THE_BARRENS': 'Forgés dans les Tarides',
  'THE_LOST_CITY': 'La Cité Perdue',
  'THE_SUNKEN_CITY': 'Le Trône des Abysses',
  'TITANS': 'Les Titans',
  'TROLL': 'Jeux de Rastakhan',
  'ULDUM': 'Les Aventuriers d\'Uldum',
  'UNGORO': 'Un\'Goro',
  'WHIZBANGS_WORKSHOP': 'L\'Atelier du Génistordu',
  'WILD_WEST': 'Rixe en Terres Ingrates',
  'YEAR_OF_THE_DRAGON': 'Année du Dragon'
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
