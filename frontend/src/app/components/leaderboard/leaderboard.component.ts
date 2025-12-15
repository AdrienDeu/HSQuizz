import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaderboardService } from '../../services/leaderboard.service';
import { 
  LeaderboardEntry, 
  LeaderboardRegion, 
  GameMode,
  REGION_LABELS,
  GAME_MODE_LABELS
} from '../../models/leaderboard.model';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss'
})
export class LeaderboardComponent implements OnInit {
  // Données
  allEntries: LeaderboardEntry[] = [];
  leaderboardEntries: LeaderboardEntry[] = [];
  loading: boolean = true;
  error: string | null = null;

  // Filtres
  selectedRegion: LeaderboardRegion = 'EU';
  selectedGameMode: GameMode = 'standard';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 100;
  totalPages: number = 1;
  
  // Options disponibles
  regions: LeaderboardRegion[] = [];
  gameModes: GameMode[] = [];
  
  // Labels
  regionLabels = REGION_LABELS;
  gameModeLabels = GAME_MODE_LABELS;

  constructor(private leaderboardService: LeaderboardService) {}

  ngOnInit(): void {
    this.regions = this.leaderboardService.getAvailableRegions();
    this.gameModes = this.leaderboardService.getAvailableGameModes();
    this.loadLeaderboard();
  }

  /**
   * Charge le leaderboard avec les filtres actuels
   */
  loadLeaderboard(): void {
    this.loading = true;
    this.error = null;

    this.leaderboardService.getLeaderboard(this.selectedRegion, this.selectedGameMode).subscribe({
      next: (entries) => {
        this.allEntries = entries;
        this.totalPages = Math.ceil(entries.length / this.itemsPerPage);
        this.currentPage = 1;
        this.updateDisplayedEntries();
        this.loading = false;
        
        if (entries.length === 0) {
          this.error = 'Aucune donnée disponible pour cette sélection.';
        }
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du leaderboard. Veuillez réessayer.';
        this.loading = false;
        console.error('Error loading leaderboard:', err);
      }
    });
  }

  /**
   * Appelé quand la région change
   */
  onRegionChange(): void {
    this.loadLeaderboard();
  }

  /**
   * Appelé quand le mode de jeu change
   */
  onGameModeChange(): void {
    this.loadLeaderboard();
  }

  /**
   * Met à jour les entrées affichées selon la page courante
   */
  updateDisplayedEntries(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.leaderboardEntries = this.allEntries.slice(startIndex, endIndex);
  }

  /**
   * Va à la page précédente
   */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedEntries();
    }
  }

  /**
   * Va à la page suivante
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayedEntries();
    }
  }

  /**
   * Va à une page spécifique
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedEntries();
    }
  }

  /**
   * Retourne le range affiché (ex: "1-100")
   */
  getDisplayedRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.allEntries.length);
    return `${start}-${end}`;
  }

  /**
   * Retourne la classe CSS pour la médaille selon le rang
   */
  getMedalClass(rank: number): string {
    switch (rank) {
      case 1: return 'gold';
      case 2: return 'silver';
      case 3: return 'bronze';
      default: return '';
    }
  }

  /**
   * Retourne l'emoji de médaille selon le rang
   */
  getMedalEmoji(rank: number): string {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  }
}
