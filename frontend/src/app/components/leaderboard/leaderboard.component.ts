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
  leaderboardEntries: LeaderboardEntry[] = [];
  loading: boolean = true;
  error: string | null = null;
  totalEntries: number = 0;

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
    this.loadLeaderboardPage(1);
  }

  /**
   * Charge une page du leaderboard avec les filtres actuels
   */
  loadLeaderboardPage(page: number): void {
    this.loading = true;
    this.error = null;
    this.currentPage = page;
    this.leaderboardService.getLeaderboardPage(this.selectedRegion, this.selectedGameMode, page).subscribe({
      next: (entries) => {
        // Si on reçoit 0 entrées et qu'on n'est pas sur la page 1
        if (entries.length === 0 && page > 1) {
          // Page vide : on a atteint la fin, on reste sur la page précédente
          this.totalPages = page - 1;
          this.currentPage = page - 1;
          // Ne pas vider les entrées, garder celles de la page précédente affichées
          // et juste désactiver le bouton suivant
          this.loading = false;
          return;
        }

        // Mettre à jour les entrées seulement si on a des données ou si c'est la page 1
        this.leaderboardEntries = entries;

        // Si on reçoit 0 entrées sur la page 1
        if (entries.length === 0) {
          this.error = 'Aucune donnée disponible pour cette sélection.';
          this.totalPages = 1;
          this.totalEntries = 0;
        }
        // Si on reçoit moins que itemsPerPage, c'est la dernière page
        else if (entries.length < this.itemsPerPage) {
          this.totalEntries = (page - 1) * this.itemsPerPage + entries.length;
          this.totalPages = page;
        }
        // Page complète : on suppose qu'il y a potentiellement une page suivante
        else {
          this.totalEntries = page * this.itemsPerPage;
          this.totalPages = page + 1;
        }

        this.loading = false;
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
    this.loadLeaderboardPage(1);
  }

  /**
   * Appelé quand le mode de jeu change
   */
  onGameModeChange(): void {
    this.loadLeaderboardPage(1);
  }

  /**
   * Met à jour les entrées affichées selon la page courante
   */
  // Pagination côté serveur : rien à faire ici

  /**
   * Va à la page précédente
   */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.loadLeaderboardPage(this.currentPage - 1);
    }
  }

  /**
   * Va à la page suivante
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.loadLeaderboardPage(this.currentPage + 1);
    }
  }

  /**
   * Va à une page spécifique
   */
  goToPage(page: number): void {
    if (page >= 1) {
      this.loadLeaderboardPage(page);
    }
  }

  /**
   * Retourne le range affiché (ex: "1-100")
   */
  getDisplayedRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = start + this.leaderboardEntries.length - 1;
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
