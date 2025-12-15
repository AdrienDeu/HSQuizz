import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, of } from 'rxjs';
import { 
  LeaderboardEntry, 
  LeaderboardRegion, 
  GameMode,
  LeaderboardResponse 
} from '../models/leaderboard.model';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  // Use proxy in development to avoid CORS issues
  private readonly API_BASE_URL = '/api/blizzard/leaderboardsData';
  private readonly PLAYERS_PER_PAGE = 25;

  constructor(private http: HttpClient) {}

  // Season IDs for each game mode (updated periodically)
  private readonly SEASON_IDS: Record<GameMode, number> = {
    'standard': 146,
    'wild': 146,
    'classic': 116,
    'battlegrounds': 17,
    'battlegroundsduo': 17,
    'mercenaries': 50,
    'twist': 136,
    'arena': 56
  };

  /**
   * Récupère le leaderboard pour une région et un mode de jeu donnés
   * L'API Blizzard retourne 25 joueurs par page, donc on fait plusieurs requêtes
   * @param region La région (EU, US, AP)
   * @param gameMode Le mode de jeu (standard, wild, battlegrounds, etc.)
   * @param limit Nombre maximum d'entrées à retourner (défaut: 1000)
   */
  getLeaderboard(
    region: LeaderboardRegion = 'EU',
    gameMode: GameMode = 'standard',
    limit: number = 1000
  ): Observable<LeaderboardEntry[]> {
    const seasonId = this.SEASON_IDS[gameMode] || 146;
    const numberOfPages = Math.ceil(limit / this.PLAYERS_PER_PAGE); // 8 pages pour 200 joueurs
    
    const pageRequests: Observable<LeaderboardEntry[]>[] = [];
    for (let page = 1; page <= numberOfPages; page++) {
      const url = `${this.API_BASE_URL}?region=${region}&leaderboardId=${gameMode}&seasonId=${seasonId}&page=${page}`;
      pageRequests.push(
        this.http.get<LeaderboardResponse>(url).pipe(
          map(response => response?.leaderboard?.rows || []),
          catchError(() => of([]))
        )
      );
    }
    
    // Exécuter toutes les requêtes en parallèle et combiner les résultats
    return forkJoin(pageRequests).pipe(
      map(results => {
        const allEntries = results.flat();
        return allEntries.slice(0, limit);
      }),
      catchError(error => {
        console.error('Erreur lors du chargement du leaderboard:', error);
        return of([]);
      })
    );
  }

  /**
   * Récupère les régions disponibles
   */
  getAvailableRegions(): LeaderboardRegion[] {
    return ['EU', 'US', 'AP'];
  }

  /**
   * Récupère les modes de jeu disponibles
   */
  getAvailableGameModes(): GameMode[] {
    return [
      'standard',
      'wild',
      'battlegrounds',
      'battlegroundsduo',
      'arena',
      'classic',
      'twist',
      'mercenaries'
    ];
  }
}
