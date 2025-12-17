import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from '../../../models/card.model';
import { CardService } from '../../../services/card.service';

/**
 * Composant réutilisable pour afficher une carte
 * Utilisé dans la collection et dans le deck
 */
@Component({
  selector: 'app-deck-card-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './deck-card-item.component.html',
  styleUrl: './deck-card-item.component.scss'
})
export class DeckCardItemComponent {
  @Input() card!: Card;
  @Input() compact: boolean = false; // Mode compact pour drag preview
  @Input() showDetails: boolean = true; // Afficher les détails (attack/health)
  @Output() cardClick = new EventEmitter<Card>();

  /**
   * Gère le clic sur la carte
   */
  onClick(): void {
    this.cardClick.emit(this.card);
  }

  /**
   * Retourne la classe CSS pour la rareté
   */
  get rarityClass(): string {
    return this.card.rarity?.toLowerCase() || 'common';
  }

  /**
   * Retourne le nom traduit du type
   */
  get Type(): string {
    return this.card.type;
  }

  /**
   * Retourne le nom traduit de la classe
   */
  get translatedClass(): string {
    return this.card.cardClass;
  }

  /**
   * Retourne le nom traduit de la rareté
   */
  get Rarity(): string {
    return this.card.rarity?.toString() || '-';
  }

  /**
   * Vérifie si la carte est un serviteur
   */
  get isMinion(): boolean {
    return this.card.type === 'MINION';
  }

  /**
   * Vérifie si la carte est une arme
   */
  get isWeapon(): boolean {
    return this.card.type === 'WEAPON';
  }

  /**
   * Vérifie si la carte est un sort
   */
  get isSpell(): boolean {
    return this.card.type === 'SPELL';
  }

  /**
   * Récupère la couleur de la classe
   */
  get classColor(): string {
    const colors: Record<string, string> = {
      'NEUTRAL': '#888',
      'MAGE': '#69ccf0',
      'WARRIOR': '#c79c6e',
      'PALADIN': '#f58cba',
      'HUNTER': '#abd473',
      'ROGUE': '#fff569',
      'PRIEST': '#ffffff',
      'SHAMAN': '#0070de',
      'WARLOCK': '#9482c9',
      'DRUID': '#ff7d0a',
      'DEMONHUNTER': '#a330c9',
      'DEATHKNIGHT': '#c41f3b'
    };
    return colors[this.card.cardClass] || '#888';
  }

  get cardImageUrl(): string {
    return `https://art.hearthstonejson.com/v1/render/latest/enUS/256x/${this.card.id}.png`;
  }
}
