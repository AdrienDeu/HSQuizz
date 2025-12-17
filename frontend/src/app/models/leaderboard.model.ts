/**
 * Interface représentant une entrée du leaderboard Hearthstone
 */
export interface LeaderboardEntry {
  rank: number;
  accountid: string;
  rating?: number;
}

/**
 * Réponse de l'API leaderboard
 */
export interface LeaderboardResponse {
  leaderboard: {
    rows: LeaderboardEntry[];
  };
  seasonMetaData: Record<string, Record<string, GameModeMetaData>>;
}

/**
 * Métadonnées d'un mode de jeu
 */
export interface GameModeMetaData {
  name: string;
  ratingId: number;
  seasons: SeasonInfo[];
}

/**
 * Information sur une saison
 */
export interface SeasonInfo {
  season_id: number;
  key: { href: string };
  mode: {
    mode_id: number;
    mode_name: string;
    key: { href: string };
  };
  display_name?: Record<string, string>;
}

/**
 * Régions disponibles
 */
export type LeaderboardRegion = 'EU' | 'US' | 'AP';

/**
 * Modes de jeu disponibles
 */
export type GameMode = 
  | 'standard' 
  | 'wild' 
  | 'battlegrounds' 
  | 'battlegroundsduo'
  | 'arena' 
  | 'classic' 
  | 'twist' 
  | 'mercenaries';

/**
 * Labels pour les régions
 */
export const REGION_LABELS: Record<LeaderboardRegion, string> = {
  EU: 'Europe',
  US: 'US',
  AP: 'Asia-Pacific'
};

/**
 * Labels pour les modes de jeu
 */
export const GAME_MODE_LABELS: Record<GameMode, string> = {
  standard: 'Standard',
  wild: 'Wild',
  battlegrounds: 'Battlegrounds',
  battlegroundsduo: 'Battlegrounds Duo',
  arena: 'Arena',
  classic: 'Classic',
  twist: 'Twist',
  mercenaries: 'Mercenaries'
};
