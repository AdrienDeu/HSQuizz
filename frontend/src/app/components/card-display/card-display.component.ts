import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card, HiddenAttribute } from '../../models/card.model';

export interface DisplayableCard extends Card {
  translatedType: string;
  translatedClass: string;
  translatedRarity: string;
  translatedRace: string;
  translatedSet: string;
  cleanText: string;
  rarityClass: string;
  isMinion: boolean;
  isWeapon: boolean;
}

@Component({
  selector: 'app-card-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-display.component.html',
  styleUrl: './card-display.component.scss'
})
export class CardDisplayComponent {
  @Input() card!: DisplayableCard;
  @Input() hiddenAttribute: HiddenAttribute = 'name';
  @Input() revealed: boolean = false;

  getDisplayValue(attribute: HiddenAttribute, value: string | number | undefined): string {
    if (attribute === this.hiddenAttribute && !this.revealed) {
      return '???';
    }
    return value?.toString() ?? '-';
  }

  isHidden(attribute: HiddenAttribute): boolean {
    return attribute === this.hiddenAttribute && !this.revealed;
  }
}