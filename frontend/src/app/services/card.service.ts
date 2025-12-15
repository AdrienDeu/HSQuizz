import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { Card, HiddenAttribute, SET_TRANSLATIONS } from '../models/card.model';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private readonly CARDS_URL = 'hearthstone_cards.json';
  private cards$: Observable<Card[]> | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Charge toutes les cartes collectibles depuis le fichier JSON
   * Utilise shareReplay pour mettre en cache le résultat
   */
  getCollectibleCards(): Observable<Card[]> {
    if (!this.cards$) {
      this.cards$ = this.http.get<Card[]>(this.CARDS_URL).pipe(
        map(cards => this.filterCollectibleCards(cards)),
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
      'NEUTRAL': 'Neutre',
      'MAGE': 'Mage',
      'WARRIOR': 'Guerrier',
      'PALADIN': 'Paladin',
      'HUNTER': 'Chasseur',
      'ROGUE': 'Voleur',
      'PRIEST': 'Prêtre',
      'SHAMAN': 'Chaman',
      'WARLOCK': 'Démoniste',
      'DRUID': 'Druide',
      'DEMONHUNTER': 'Chasseur de démons',
      'DEATHKNIGHT': 'Chevalier de la mort'
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
