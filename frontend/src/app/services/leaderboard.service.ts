import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { switchMap, catchError, tap, startWith, map } from 'rxjs/operators';
import { LeaderboardEntry, LeaderboardRegion, GameMode, LeaderboardResponse } from '../models/leaderboard.model';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private readonly API_BASE_URL = '/api/blizzard/leaderboardsData';

  private readonly _region$ = new BehaviorSubject<LeaderboardRegion>('EU');
  private readonly _gameMode$ = new BehaviorSubject<GameMode>('standard');
  private readonly _page$ = new BehaviorSubject<number>(1);
  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  private readonly _error$ = new BehaviorSubject<string | null>(null);

  public readonly leaderboard$: Observable<LeaderboardEntry[]>;
  public readonly region$: Observable<LeaderboardRegion> = this._region$.asObservable();
  public readonly gameMode$: Observable<GameMode> = this._gameMode$.asObservable();
  public readonly page$: Observable<number> = this._page$.asObservable();
  public readonly loading$: Observable<boolean> = this._loading$.asObservable();
  public readonly error$: Observable<string | null> = this._error$.asObservable();

  constructor(private http: HttpClient) {
    this.leaderboard$ = combineLatest([
      this._region$,
      this._gameMode$,
      this._page$
    ]).pipe(
      switchMap(([region, gameMode, page]) => {
        this._loading$.next(true);
        this._error$.next(null);

        const params = new HttpParams()
          .set('region', region)
          .set('leaderboardId', gameMode)
          .set('page', page.toString());

        return this.http.get<LeaderboardResponse>(this.API_BASE_URL, { params }).pipe(
          catchError(err => {
            this._error$.next('Impossible de charger le classement.');
            return of({ leaderboard: { rows: [] } });
          }),
          tap(() => this._loading$.next(false))
        );
      }),
      map(response => response?.leaderboard?.rows ?? []),
      startWith([])
    );
  }

  public setRegion(region: LeaderboardRegion): void {
    if (region !== this._region$.getValue()) {
      this._region$.next(region);
      this._page$.next(1);
    }
  }

  public setGameMode(gameMode: GameMode): void {
    if (gameMode !== this._gameMode$.getValue()) {
      this._gameMode$.next(gameMode);
      this._page$.next(1);
    }
  }

  public setPage(page: number): void {
    if (page > 0 && page !== this._page$.getValue()) {
      this._page$.next(page);
    }
  }

  public getAvailableRegions(): LeaderboardRegion[] {
    return ['EU', 'US', 'AP'];
  }

  public getAvailableGameModes(): GameMode[] {
    return [
      'standard', 'wild', 'classic', 'twist',
      'battlegrounds', 'battlegroundsduo', 'arena', 'mercenaries'
    ];
  }
}
