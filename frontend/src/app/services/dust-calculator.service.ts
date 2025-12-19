import { Injectable } from '@angular/core';
import { Card } from '../models/card.model';
import { DUST_VALUES } from '../utils/constants.util';

export interface DustStats {
  totalDust: number;
  rarityBreakdown: { [rarity: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class DustCalculatorService {

  constructor() { }

  calculateDustCost(deck: Card[]): DustStats {
    let totalDust = 0;
    const rarityBreakdown: { [rarity: string]: number } = {};

    for (const card of deck) {
      if (card.rarity) {
        const rarityKey = card.rarity.toUpperCase();
        const dustValue = DUST_VALUES[rarityKey];

        if (dustValue !== undefined) {
          totalDust += dustValue;
          rarityBreakdown[rarityKey] = (rarityBreakdown[rarityKey] || 0) + dustValue;
        }
      }
    }

    return { totalDust, rarityBreakdown };
  }
}