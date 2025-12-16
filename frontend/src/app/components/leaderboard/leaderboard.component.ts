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

  // Filtres
  selectedRegion: LeaderboardRegion = 'EU';
  selectedGameMode: GameMode = 'standard';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 100; // Afficher 100 joueurs par page
  totalPages: number = 10; // 1000 joueurs / 100 = 10 pages
  maxPlayers: number = 1000; // Limite totale de joueurs

  // Pour la navigation directe
  pageInput: string = '1';

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
    this.loadPage(1);
  }

  /**
   * Charge une page spécifique du leaderboard
   */
  loadPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }

    this.loading = true;
    this.error = null;
    this.currentPage = page;
    this.pageInput = page.toString();

    this.leaderboardService.getLeaderboardPage(
      this.selectedRegion,
      this.selectedGameMode,
      page
    ).subscribe({
      next: (entries) => {
        if (entries.length === 0) {
          this.error = 'Aucune donnée disponible pour cette sélection.';
        }
        this.leaderboardEntries = entries;
        this.loading = false;

        // Scroll vers le haut du tableau après le chargement
        setTimeout(() => {
          const tableContainer = document.querySelector('.table-container');
          if (tableContainer) {
            tableContainer.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 0);
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
    this.loadPage(1);
  }

  /**
   * Appelé quand le mode de jeu change
   */
  onGameModeChange(): void {
    this.loadPage(1);
  }

  /**
   * Va à la page précédente
   */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.loadPage(this.currentPage - 1);
    }
  }

  /**
   * Va à la page suivante
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.loadPage(this.currentPage + 1);
    }
  }

  /**
   * Va à une page spécifique depuis l'input
   */
  goToPageFromInput(): void {
    const page = parseInt(this.pageInput, 10);
    if (!isNaN(page) && page >= 1 && page <= this.totalPages) {
      this.loadPage(page);
    } else {
      // Réinitialiser l'input si invalide
      this.pageInput = this.currentPage.toString();
    }
  }

  /**
   * Retourne les numéros de pages à afficher dans la pagination
   */
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5; // Nombre maximum de pages visibles

    if (this.totalPages <= maxVisible) {
      // Afficher toutes les pages si peu de pages
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Afficher un sous-ensemble de pages autour de la page actuelle
      let start = Math.max(1, this.currentPage - 2);
      let end = Math.min(this.totalPages, this.currentPage + 2);

      // Ajuster si trop proche du début ou de la fin
      if (this.currentPage <= 3) {
        end = maxVisible;
      } else if (this.currentPage >= this.totalPages - 2) {
        start = this.totalPages - maxVisible + 1;
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  /**
   * Retourne le range de joueurs affichés
   */
  getDisplayedRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.maxPlayers);
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
