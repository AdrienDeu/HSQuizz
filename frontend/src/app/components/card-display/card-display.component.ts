import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card, HiddenAttribute, SET_TRANSLATIONS } from '../../models/card.model';
import { CardService } from '../../services/card.service';

@Component({
  selector: 'app-card-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-display.component.html',
  styleUrl: './card-display.component.scss'
})
export class CardDisplayComponent {
  @Input() card!: Card;
  @Input() hiddenAttribute: HiddenAttribute = 'name';
  @Input() revealed: boolean = false;

  /**
   * Retourne la valeur à afficher pour un attribut
   * Masque si c'est l'attribut à deviner et non révélé
   */
  getDisplayValue(attribute: HiddenAttribute, value: string | number | undefined): string {
    if (attribute === this.hiddenAttribute && !this.revealed) {
      return '???';
    }
    return value?.toString() ?? '-';
  }

  /**
   * Vérifie si un attribut doit être masqué
   */
  isHidden(attribute: HiddenAttribute): boolean {
    return attribute === this.hiddenAttribute && !this.revealed;
  }

  get translatedType(): string {
    return CardService.translateType(this.card.type);
  }

  get translatedClass(): string {
    return CardService.translateClass(this.card.cardClass);
  }

  get translatedRarity(): string {
    return this.card.rarity ? CardService.translateRarity(this.card.rarity) : '-';
  }

  get translatedRace(): string {
    return this.card.race ? CardService.translateRace(this.card.race) : '';
  }

  get translatedSet(): string {
    return SET_TRANSLATIONS[this.card.set] || this.card.set;
  }

  get cleanText(): string {
    return CardService.cleanCardText(this.card.text);
  }

  get isMinion(): boolean {
    return this.card.type === 'MINION';
  }

  get isWeapon(): boolean {
    return this.card.type === 'WEAPON';
  }

  get rarityClass(): string {
    return this.card.rarity?.toLowerCase() ?? 'common';
  }

  get cardImageUrl(): string {
    return `https://art.hearthstonejson.com/v1/render/latest/enUS/512x/${this.card.id}.png`;
  }
}
