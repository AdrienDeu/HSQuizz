export interface LeaderboardEntry {
  rank: number;
  accountid: string;
  rating?: number;
}

export interface LeaderboardResponse {
  leaderboard: {
    rows: LeaderboardEntry[];
  };
  seasonMetaData: Record<string, Record<string, GameModeMetaData>>;
}

export interface GameModeMetaData {
  name: string;
  ratingId: number;
  seasons: SeasonInfo[];
}

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

export type LeaderboardRegion = 'EU' | 'US' | 'AP';

export type GameMode =
  | 'standard'
  | 'wild'
  | 'battlegrounds'
  | 'battlegroundsduo'
  | 'arena'
  | 'classic'
  | 'twist'
  | 'mercenaries';
