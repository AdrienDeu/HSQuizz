import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Card, HiddenAttribute } from '../models/card.model';

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
      .map(code => ({ code, name: code }))
      .sort((a, b) => a.name.localeCompare(b.name));
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

  static cleanCardText(text: string | undefined): string {
    if (!text) return '';
    return text.replace(/<\/?[^>]+(>|$)/g, "").replace(/\$/g, "").replace(/\[x\]/g, "").trim();
  }
}