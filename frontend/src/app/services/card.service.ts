import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay, catchError, tap } from 'rxjs';
import { Card, HiddenAttribute, SET_TRANSLATIONS } from '../models/card.model';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  // API via backend (proxy pour éviter CORS)
  private readonly API_URL = '/api/hearthstone/cards';
  // Fichier JSON local en backup
  private readonly BACKUP_URL = 'hearthstone_cards.json';
  private cards$: Observable<Card[]> | null = null;
  private lastIncludeNonCollectible: boolean = false;

  constructor(private http: HttpClient) {}

  /**
   * Charge toutes les cartes depuis l'API via le backend
   * Le backend fait un proxy vers HearthstoneJSON et filtre les cartes collectibles
   * Utilise le fichier JSON local en fallback si l'API échoue
   * Utilise shareReplay pour mettre en cache le résultat
   */
  getCollectibleCards(includeNonCollectible: boolean = false): Observable<Card[]> {
    // Si le paramètre change par rapport au dernier appel, on invalide le cache
    if (this.cards$ && this.lastIncludeNonCollectible !== includeNonCollectible) {
      console.log(`🔄 Changement de filtre détecté (${this.lastIncludeNonCollectible} -> ${includeNonCollectible}), invalidation du cache...`);
      this.cards$ = null;
    }

    // Sauvegarder l'état actuel
    this.lastIncludeNonCollectible = includeNonCollectible;

    if (!this.cards$) {
      const url = includeNonCollectible
        ? `${this.API_URL}?includeNonCollectible=true`
        : this.API_URL;

      console.log(`📡 Requête API: ${url}`);

      this.cards$ = this.http.get<Card[]>(url).pipe(
        tap((cards) => console.log(`✅ ${cards.length} cartes chargées depuis l'API`)),
        catchError(error => {
          console.warn('⚠️ Erreur API, utilisation du fichier backup:', error.message);
          return this.http.get<Card[]>(this.BACKUP_URL).pipe(
            tap(() => console.log('✅ Cartes chargées depuis le fichier backup')),
            map(cards => includeNonCollectible ? cards : this.filterCollectibleCards(cards))
          );
        }),
        shareReplay(1)
      );
    }
    return this.cards$;
  }

  /**
   * Récupère la liste des extensions disponibles dans les cartes
   * Retourne un tableau trié par nom traduit
   */
  getAvailableSets(): Observable<{ code: string; name: string }[]> {
    return this.getCollectibleCards().pipe(
      map(cards => {
        const sets = new Set<string>();
        cards.forEach(card => {
          if (card.set) {
            sets.add(card.set);
          }
        });
        return Array.from(sets)
          .map(code => ({
            code,
            name: SET_TRANSLATIONS[code] || code
          }))
          .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
      })
    );
  }

  /**
   * Filtre les cartes par extension(s)
   * Si selectedSets est vide, retourne toutes les cartes
   */
  filterCardsBySets(cards: Card[], selectedSets: string[]): Card[] {
    if (!selectedSets || selectedSets.length === 0) {
      return cards;
    }
    return cards.filter(card => selectedSets.includes(card.set));
  }

  /**
   * Filtre les cartes selon l'attribut à deviner
   * Certains attributs nécessitent que la carte ait une valeur définie
   */
  filterCardsByAttribute(cards: Card[], attribute: HiddenAttribute): Card[] {
    switch (attribute) {
      case 'attack':
        return cards.filter(card => card.attack !== undefined);
      case 'health':
        return cards.filter(card => card.health !== undefined);
      case 'rarity':
        return cards.filter(card => card.rarity !== undefined);
      case 'cost':
        return cards.filter(card => card.cost !== undefined);
      default:
        return cards;
    }
  }

  /**
   * Récupère des cartes par leurs DBF IDs
   * Utilisé pour l'import de decks depuis un code
   * Cherche dans toutes les cartes (incluant non-collectibles) pour maximiser les résultats
   */
  getCardsByDbfIds(dbfIds: number[]): Observable<Card[]> {
    return this.getCollectibleCards(true).pipe(
      map(allCards => {
        console.log(`🔍 Recherche dans ${allCards.length} cartes disponibles`);

        const cardMap = new Map<number, Card>();
        allCards.forEach(card => {
          if (card.dbfId) {
            cardMap.set(card.dbfId, card);
          }
        });

        console.log(`📊 Index créé avec ${cardMap.size} cartes uniques`);

        const foundCards: Card[] = [];
        const missingIds: number[] = [];

        dbfIds.forEach(dbfId => {
          const card = cardMap.get(dbfId);
          if (card) {
            foundCards.push(card);
          } else {
            missingIds.push(dbfId);
          }
        });

        console.log(`✅ Trouvées: ${foundCards.length}, ❌ Manquantes: ${missingIds.length}`);

        if (missingIds.length > 0) {
          console.warn(`⚠️ Cartes non trouvées pour DBF IDs:`, missingIds);
        }

        return foundCards;
      })
    );
  }

  /**
   * Filtre les cartes pour ne garder que celles qui sont collectibles
   * et qui ont un nom (requis pour le quiz)
   */
  private filterCollectibleCards(cards: Card[]): Card[] {
    return cards.filter(card =>
      card.collectible === true &&
      card.name &&
      card.name.trim().length > 0
    );
  }

  /**
   * Traduit le type de carte en français
   */
  static translateType(type: string): string {
    const translations: Record<string, string> = {
      'MINION': 'Serviteur',
      'SPELL': 'Sort',
      'WEAPON': 'Arme',
      'HERO': 'Héros',
      'HERO_POWER': 'Pouvoir héroïque',
      'LOCATION': 'Lieu'
    };
    return translations[type] || type;
  }

  /**
   * Traduit la classe de carte en français
   */
  static translateClass(cardClass: string): string {
    const translations: Record<string, string> = {
      'NEUTRAL': 'Neutral',
      'MAGE': 'Mage',
      'WARRIOR': 'Warrior',
      'PALADIN': 'Paladin',
      'HUNTER': 'Hunter',
      'ROGUE': 'Rogue',
      'PRIEST': 'Priest',
      'SHAMAN': 'Shaman',
      'WARLOCK': 'Warlock',
      'DRUID': 'Druid',
      'DEMONHUNTER': 'Demon Hunter',
      'DEATHKNIGHT': 'Death Knight'
    };
    return translations[cardClass] || cardClass;
  }

  /**
   * Traduit la rareté en français
   */
  static translateRarity(rarity: string): string {
    const translations: Record<string, string> = {
      'FREE': 'Gratuit',
      'COMMON': 'Commune',
      'RARE': 'Rare',
      'EPIC': 'Épique',
      'LEGENDARY': 'Légendaire'
    };
    return translations[rarity] || rarity;
  }

  /**
   * Traduit l'extension en français
   */
  static translateSet(set: string): string {
    return SET_TRANSLATIONS[set] || set;
  }

  /**
   * Traduit la race en français
   */
  static translateRace(race: string): string {
    const translations: Record<string, string> = {
      'BEAST': 'Bête',
      'DRAGON': 'Dragon',
      'MURLOC': 'Murloc',
      'DEMON': 'Démon',
      'MECH': 'Méca',
      'PIRATE': 'Pirate',
      'TOTEM': 'Totem',
      'ELEMENTAL': 'Élémentaire',
      'UNDEAD': 'Mort-vivant',
      'NAGA': 'Naga',
      'QUILBOAR': 'Sanglie',
      'ALL': 'Tout'
    };
    return translations[race] || race;
  }

  /**
   * Nettoie le texte HTML des cartes
   */
  static cleanCardText(text: string | undefined): string {
    if (!text) return '';
    // Supprime les balises HTML et remplace les symboles spéciaux
    return text
      .replace(/<\/?[^>]+(>|$)/g, '')
      .replace(/\$/g, '')
      .replace(/\[x\]/g, '')
      .trim();
  }
}
