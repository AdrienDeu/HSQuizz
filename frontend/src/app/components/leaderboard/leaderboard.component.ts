import { Component } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { LeaderboardService } from '../../services/leaderboard.service';
import {
  LeaderboardEntry,
  LeaderboardRegion,
  GameMode
} from '../../models/leaderboard.model';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, FormsModule, AsyncPipe],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss'
})
export class LeaderboardComponent {
  public readonly leaderboard$: Observable<LeaderboardEntry[]>;
  public readonly region$: Observable<LeaderboardRegion>;
  public readonly gameMode$: Observable<GameMode>;
  public readonly page$: Observable<number>;
  public readonly loading$: Observable<boolean>;

  public readonly regions: LeaderboardRegion[];
  public readonly gameModes: GameMode[];

  constructor(private leaderboardService: LeaderboardService) {
    this.leaderboard$ = this.leaderboardService.leaderboard$;
    this.region$ = this.leaderboardService.region$;
    this.gameMode$ = this.leaderboardService.gameMode$;
    this.page$ = this.leaderboardService.page$;
    this.loading$ = this.leaderboardService.loading$;

    this.regions = this.leaderboardService.getAvailableRegions();
    this.gameModes = this.leaderboardService.getAvailableGameModes();
  }


  public onRegionChange(region: LeaderboardRegion): void {
    this.leaderboardService.setRegion(region);
  }

  public onGameModeChange(gameMode: GameMode): void {
    this.leaderboardService.setGameMode(gameMode);
  }

  public previousPage(currentPage: number): void {
    this.leaderboardService.setPage(currentPage - 1);
  }

  public nextPage(currentPage: number): void {
    this.leaderboardService.setPage(currentPage + 1);
  }


  public getMedalClass(rank: number): string {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return '';
  }

  public getPlayerName(accountId: string): string {
    return accountId.split('#')[0];
  }
}