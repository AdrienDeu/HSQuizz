import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, shareReplay, catchError } from 'rxjs/operators';
import { Card, HiddenAttribute, SET_TRANSLATIONS } from '../models/card.model';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private readonly API_URL = '/api/hearthstone/cards';
  private cardsCache: { [key: string]: Observable<Card[]> } = {};

  constructor(private http: HttpClient) {}

  public getCards(includeNonCollectible: boolean = false): Observable<Card[]> {
    const params = new HttpParams().set('includeNonCollectible', includeNonCollectible.toString());

    return this.http.get<Card[]>(this.API_URL, { params }).pipe(
      catchError(() => of([]))
    );
  }

  public getAvailableSets(cards: Card[]): { code: string; name: string }[] {
    const sets = new Set<string>(cards.map(card => card.set));
    return Array.from(sets)
      .map(code => ({ code, name: SET_TRANSLATIONS[code] || code }))
      .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  }

  public filterCardsBySets(cards: Card[], selectedSets: string[]): Card[] {
    if (!selectedSets || selectedSets.length === 0) return cards;
    return cards.filter(card => selectedSets.includes(card.set));
  }

  public filterCardsByAttribute(cards: Card[], attribute: HiddenAttribute): Card[] {
    switch (attribute) {
      case 'attack':
        return cards.filter(c => c.type === 'MINION' && c.attack !== undefined && c.attack >= 0);
      case 'health':
        return cards.filter(c => c.type === 'MINION' && c.health !== undefined && c.health > 0);
      case 'rarity':
        return cards.filter(c => c.rarity !== undefined);
      case 'cost':
        return cards.filter(c => c.cost !== undefined && c.cost >= 0);
      default:
        return cards;
    }
  }

  static translateType(type: string): string {
    const translations: Record<string, string> = { 'MINION': 'Serviteur', 'SPELL': 'Sort', 'WEAPON': 'Arme', 'HERO': 'Héros', 'LOCATION': 'Lieu' };
    return translations[type] || type;
  }

  static translateClass(cardClass: string): string {
    const translations: Record<string, string> = { 'NEUTRAL': 'Neutre', 'MAGE': 'Mage', 'WARRIOR': 'Guerrier', 'PALADIN': 'Paladin', 'HUNTER': 'Chasseur', 'ROGUE': 'Voleur', 'PRIEST': 'Prêtre', 'SHAMAN': 'Chaman', 'WARLOCK': 'Démoniste', 'DRUID': 'Druide', 'DEMONHUNTER': 'Chasseur de démons', 'DEATHKNIGHT': 'Chevalier de la mort' };
    return translations[cardClass] || cardClass;
  }

  static translateRarity(rarity: string): string {
    const translations: Record<string, string> = { 'FREE': 'Gratuit', 'COMMON': 'Commune', 'RARE': 'Rare', 'EPIC': 'Épique', 'LEGENDARY': 'Légendaire' };
    return translations[rarity] || rarity;
  }

  static translateSet(set: string): string {
    return SET_TRANSLATIONS[set] || set;
  }

  static translateRace(race: string): string {
    const translations: Record<string, string> = { 'BEAST': 'Bête', 'DRAGON': 'Dragon', 'MURLOC': 'Murloc', 'DEMON': 'Démon', 'MECH': 'Méca', 'PIRATE': 'Pirate', 'TOTEM': 'Totem', 'ELEMENTAL': 'Élémentaire', 'UNDEAD': 'Mort-vivant', 'NAGA': 'Naga', 'QUILBOAR': 'Sanglier' };
    return translations[race] || race;
  }

  static cleanCardText(text: string | undefined): string {
    if (!text) return '';
    return text.replace(/<\/?[^>]+(>|$)/g, "").replace(/\$/g, "").replace(/\[x\]/g, "").trim();
  }
}