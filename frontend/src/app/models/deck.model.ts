import { Card } from './card.model';

/**
 * Interface représentant un deck Hearthstone
 */
export interface Deck {
  id: string;                    // UUID v4
  name: string;
  heroClass: string;             // MAGE, WARRIOR, DRUID, etc.
  format: 'standard' | 'wild';
  cards: DeckCard[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Carte dans un deck avec sa quantité
 */
export interface DeckCard {
  card: Card;                    // Carte complète
  quantity: number;              // 1 ou 2 (1 pour légendaires)
}

/**
 * Deck sauvegardé avec son code d'export
 */
export interface SavedDeck extends Deck {
  deckCode: string;              // Code Hearthstone (AAECAa0G...)
}

/**
 * Critères de filtrage pour la collection de cartes
 */
export interface DeckFilters {
  heroClass: string[];           // Classes sélectionnées (peut être multiple)
  manaCosts: number[];           // Coûts de mana [0,1,2,7,10]
  rarities: string[];            // ['COMMON', 'RARE', 'EPIC', 'LEGENDARY']
  types: string[];               // ['MINION', 'SPELL', 'WEAPON', 'LOCATION']
  mechanics: string[];           // ['TAUNT', 'RUSH', 'DIVINE_SHIELD', etc.]
  searchQuery: string;           // Recherche par nom
  sets: string[];                // Extensions
}

/**
 * Statistiques calculées du deck
 */
export interface DeckStatistics {
  totalCards: number;            // Somme des quantités (doit être 30)
  uniqueCards: number;           // Nombre de cartes distinctes
  manaCurve: ManaCurveData;
  typeDistribution: TypeDistribution;
  gamePhaseDistribution: GamePhaseDistribution;
  averageManaCost: number;
  deckCompletionPercent: number; // (totalCards / 30) * 100
}

/**
 * Distribution des cartes par coût de mana
 */
export interface ManaCurveData {
  [manaCost: number]: number;    // { 0: 2, 1: 4, 2: 6, ... }
}

/**
 * Distribution des cartes par type
 */
export interface TypeDistribution {
  minions: number;
  spells: number;
  weapons: number;
  locations: number;
  heroes: number;
}

/**
 * Distribution des cartes par phase de jeu
 */
export interface GamePhaseDistribution {
  early: number;                 // 0-3 mana
  mid: number;                   // 4-6 mana
  late: number;                  // 7+ mana
  earlyPercent: number;
  midPercent: number;
  latePercent: number;
}

/**
 * Résultat de validation d'un deck
 */
export interface DeckValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Résultat de validation pour l'ajout d'une carte
 */
export interface CardAddValidation {
  valid: boolean;
  reason?: string;
}

/**
 * Schema de stockage LocalStorage
 */
export interface StorageSchema {
  version: string;               // "1.0" pour migration future
  decks: SavedDeck[];
  lastModified: number;
}

/**
 * DBF IDs des héros par classe
 * Note: Certaines classes ont plusieurs IDs (héros alternatifs, skins)
 */
export const HERO_DBF_IDS: Record<string, number> = {
  'DRUID': 274,
  'HUNTER': 31,
  'MAGE': 637,
  'PALADIN': 671,
  'PRIEST': 813,
  'ROGUE': 930,
  'SHAMAN': 1066,
  'WARLOCK': 893,
  'WARRIOR': 7,
  'DEMONHUNTER': 56550,
  'DEATHKNIGHT': 78065,
  'NEUTRAL': 1  // Utilisé pour certains decks spéciaux
};

/**
 * Mapping inverse: DBF ID vers classe
 * Inclut les héros alternatifs et skins
 */
export const DBF_ID_TO_CLASS: Record<number, string> = {
  1: 'NEUTRAL',     // Héro neutre/placeholder
  274: 'DRUID',
  31: 'HUNTER',
  637: 'MAGE',
  671: 'PALADIN',
  813: 'PRIEST',
  930: 'ROGUE',
  1066: 'SHAMAN',
  893: 'WARLOCK',
  7: 'WARRIOR',
  56550: 'DEMONHUNTER',
  78065: 'DEATHKNIGHT',
  121643: 'ROGUE'   // Héro Rogue alternatif (Maestra)
};

/**
 * Liste des mécaniques Hearthstone disponibles
 */
export const MECHANICS = [
  'BATTLECRY',
  'DEATHRATTLE',
  'TAUNT',
  'DIVINE_SHIELD',
  'CHARGE',
  'RUSH',
  'WINDFURY',
  'MEGA_WINDFURY',
  'LIFESTEAL',
  'POISONOUS',
  'STEALTH',
  'FREEZE',
  'DISCOVER',
  'COMBO',
  'OVERLOAD',
  'SPELL_DAMAGE',
  'INSPIRE',
  'QUEST',
  'SIDEQUEST',
  'MAGNETIC',
  'ECHO',
  'REBORN',
  'DORMANT',
  'SPELLBURST',
  'CORRUPT',
  'FRENZY',
  'TRADEABLE',
  'HONORABLE_KILL',
  'DREDGE',
  'COLOSSAL',
  'INFUSE',
  'LOCATION',
  'MANATHIRST'
];
