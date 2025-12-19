import { DustCalculatorService, DustStats } from './dust-calculator.service';
import { Card } from '../models/card.model';
import { DUST_VALUES } from '../utils/constants.util';

describe('DustCalculatorService', () => {
  let service: DustCalculatorService;

  beforeEach(() => {
    service = new DustCalculatorService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should calculate total dust cost for a deck', () => {
    const deck: Card[] = [
      { id: '1', dbfId: 1, name: 'Common Card 1', rarity: 'COMMON', cardClass: 'NEUTRAL', set: 'CORE', type: 'MINION' },
      { id: '2', dbfId: 2, name: 'Common Card 2', rarity: 'COMMON', cardClass: 'NEUTRAL', set: 'CORE', type: 'MINION' },
      { id: '3', dbfId: 3, name: 'Rare Card 1', rarity: 'RARE', cardClass: 'NEUTRAL', set: 'CORE', type: 'MINION' },
      { id: '4', dbfId: 4, name: 'Epic Card 1', rarity: 'EPIC', cardClass: 'NEUTRAL', set: 'CORE', type: 'MINION' },
      { id: '5', dbfId: 5, name: 'Legendary Card 1', rarity: 'LEGENDARY', cardClass: 'NEUTRAL', set: 'CORE', type: 'MINION' },
      { id: '6', dbfId: 6, name: 'Free Card 1', rarity: 'FREE', cardClass: 'NEUTRAL', set: 'CORE', type: 'MINION' },
    ];

    const expectedTotalDust =
      DUST_VALUES['COMMON'] * 2 +
      DUST_VALUES['RARE'] +
      DUST_VALUES['EPIC'] +
      DUST_VALUES['LEGENDARY'] +
      DUST_VALUES['FREE'];

    const result: DustStats = service.calculateDustCost(deck);

    expect(result.totalDust).toBe(expectedTotalDust);
  });

  it('should calculate rarity breakdown for a deck', () => {
    const deck: Card[] = [
      { id: '1', dbfId: 1, name: 'Common Card 1', rarity: 'COMMON', cardClass: 'NEUTRAL', set: 'CORE', type: 'MINION' },
      { id: '2', dbfId: 2, name: 'Common Card 2', rarity: 'COMMON', cardClass: 'NEUTRAL', set: 'CORE', type: 'MINION' },
      { id: '3', dbfId: 3, name: 'Rare Card 1', rarity: 'RARE', cardClass: 'NEUTRAL', set: 'CORE', type: 'MINION' },
      { id: '4', dbfId: 4, name: 'Epic Card 1', rarity: 'EPIC', cardClass: 'NEUTRAL', set: 'CORE', type: 'MINION' },
      { id: '5', dbfId: 5, name: 'Legendary Card 1', rarity: 'LEGENDARY', cardClass: 'NEUTRAL', set: 'CORE', type: 'MINION' },
      { id: '6', dbfId: 6, name: 'Free Card 1', rarity: 'FREE', cardClass: 'NEUTRAL', set: 'CORE', type: 'MINION' },
    ];

    const expectedRarityBreakdown = {
      'COMMON': DUST_VALUES['COMMON'] * 2,
      'RARE': DUST_VALUES['RARE'],
      'EPIC': DUST_VALUES['EPIC'],
      'LEGENDARY': DUST_VALUES['LEGENDARY'],
      'FREE': DUST_VALUES['FREE'],
    };

    const result: DustStats = service.calculateDustCost(deck);

    expect(result.rarityBreakdown).toEqual(expectedRarityBreakdown);
  });

  it('should handle cards with no rarity gracefully', () => {
    const deck: Card[] = [
      { id: '1', dbfId: 1, name: 'Card without Rarity', cardClass: 'NEUTRAL', set: 'CORE', type: 'MINION' },
      { id: '2', dbfId: 2, name: 'Common Card 1', rarity: 'COMMON', cardClass: 'NEUTRAL', set: 'CORE', type: 'MINION' },
    ];

    const expectedTotalDust = DUST_VALUES['COMMON'];
    const expectedRarityBreakdown = { 'COMMON': DUST_VALUES['COMMON'] };

    const result: DustStats = service.calculateDustCost(deck);

    expect(result.totalDust).toBe(expectedTotalDust);
    expect(result.rarityBreakdown).toEqual(expectedRarityBreakdown);
  });

  it('should return 0 dust for an empty deck', () => {
    const deck: Card[] = [];
    const result: DustStats = service.calculateDustCost(deck);

    expect(result.totalDust).toBe(0);
    expect(result.rarityBreakdown).toEqual({});
  });

  it('should handle unknown rarity values gracefully', () => {
    const deck: Card[] = [
      { id: '1', dbfId: 1, name: 'Unknown Rarity Card', rarity: 'UNKNOWN', cardClass: 'NEUTRAL', set: 'CORE', type: 'MINION' },
      { id: '2', dbfId: 2, name: 'Common Card 1', rarity: 'COMMON', cardClass: 'NEUTRAL', set: 'CORE', type: 'MINION' },
    ];

    const expectedTotalDust = DUST_VALUES['COMMON'];
    const expectedRarityBreakdown = { 'COMMON': DUST_VALUES['COMMON'] };

    const result: DustStats = service.calculateDustCost(deck);

    expect(result.totalDust).toBe(expectedTotalDust);
    expect(result.rarityBreakdown).toEqual(expectedRarityBreakdown);
  });
});