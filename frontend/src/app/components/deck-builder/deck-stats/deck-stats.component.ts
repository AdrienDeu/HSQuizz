import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeckStatistics } from '../../../models/deck.model';

/**
 * Composant d'affichage des statistiques du deck
 * Affiche la courbe de mana, distribution des types, et phases de jeu
 */
@Component({
  selector: 'app-deck-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './deck-stats.component.html',
  styleUrl: './deck-stats.component.scss'
})
export class DeckStatsComponent implements OnChanges {
  @Input() stats!: DeckStatistics;

  // Données pour l'affichage
  manaCurveData: { cost: number; count: number; height: number }[] = [];
  maxManaCount: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stats'] && this.stats) {
      this.calculateManaCurveDisplay();
    }
  }

  /**
   * Calcule les données d'affichage de la courbe de mana
   */
  private calculateManaCurveDisplay(): void {
    const curve = this.stats.manaCurve;

    // Trouver le maximum pour normaliser les hauteurs
    this.maxManaCount = Math.max(...Object.values(curve), 1);

    // Créer les données pour chaque coût de mana (0-10+)
    this.manaCurveData = [];
    for (let cost = 0; cost <= 10; cost++) {
      const count = curve[cost] || 0;
      const height = this.maxManaCount > 0 ? (count / this.maxManaCount) * 100 : 0;

      this.manaCurveData.push({
        cost,
        count,
        height
      });
    }
  }

  /**
   * Retourne le label pour un coût de mana
   */
  getManaCostLabel(cost: number): string {
    return cost === 10 ? '10+' : cost.toString();
  }

  /**
   * Retourne la couleur pour une phase de jeu
   */
  getPhaseColor(phase: 'early' | 'mid' | 'late'): string {
    const colors = {
      early: '#4caf50',
      mid: '#ff9900',
      late: '#f44336'
    };
    return colors[phase];
  }

  /**
   * Retourne le niveau de warning pour une phase
   */
  getPhaseWarning(phase: 'early' | 'mid' | 'late'): string | null {
    const percent = this.stats.gamePhaseDistribution[`${phase}Percent`];

    if (phase === 'early' && percent < 20) {
      return 'Peu de cartes early game';
    }
    if (phase === 'late' && percent > 40) {
      return 'Trop de cartes late game';
    }
    return null;
  }
}
