import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, shareReplay, catchError, tap } from 'rxjs/operators';
import { Card, HiddenAttribute, SET_TRANSLATIONS } from '../models/card.model';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  // URL de notre backend proxy
  private readonly API_URL = '/api/hearthstone/cards';
  
  // Cache pour les requêtes de cartes (une pour collectibles, une pour toutes)
  private cardsCache: { [key: string]: Observable<Card[]> } = {};

  constructor(private http: HttpClient) {}

  /**
   * Charge toutes les cartes depuis l'API via le backend.
   * Le backend lui-même met en cache la réponse de l'API HearthstoneJSON.
   * On utilise ici shareReplay pour mettre en cache la réponse côté client
   * pour la durée de la session, afin d'éviter de multiples appels pour la même liste.
   */
  public getCards(includeNonCollectible: boolean = false): Observable<Card[]> {
    const cacheKey = includeNonCollectible ? 'all' : 'collectible';

    if (!this.cardsCache[cacheKey]) {
      const params = new HttpParams().set('includeNonCollectible', includeNonCollectible.toString());
      
      this.cardsCache[cacheKey] = this.http.get<Card[]>(this.API_URL, { params }).pipe(
        tap(cards => console.log(`✅ ${cards.length} cartes chargées depuis l'API (mode: ${cacheKey})`)),
        catchError(error => {
          console.error(`⚠️ Erreur API pour les cartes (mode: ${cacheKey}), retour d'un tableau vide.`, error.message);
          return of([]); // En cas d'erreur, retourner un tableau vide pour ne pas casser l'application.
        }),
        shareReplay(1) // Met en cache la dernière réponse et la rejoue pour les nouveaux abonnés.
      );
    }
    return this.cardsCache[cacheKey];
  }

  /**
   * Récupère la liste des extensions uniques à partir de la liste de cartes.
   */
  public getAvailableSets(cards: Card[]): { code: string; name: string }[] {
    const sets = new Set<string>(cards.map(card => card.set));
    return Array.from(sets)
      .map(code => ({ code, name: SET_TRANSLATIONS[code] || code }))
      .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  }

  // --- Fonctions Pures (utilisées par le QuizService) ---
  
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

  // --- Méthodes Statiques (Helpers) ---

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