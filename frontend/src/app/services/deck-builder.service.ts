import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, distinctUntilChanged, debounceTime } from 'rxjs/operators';
import {
  Deck,
  DeckCard,
  DeckStatistics,
  DeckFilters,
  CardAddValidation,
  DeckValidation,
  ManaCurveData,
  TypeDistribution,
  GamePhaseDistribution
} from '../models/deck.model';
import { Card } from '../models/card.model';
import { CardService } from './card.service';

/**
 * Extensions valides en mode Standard (Core + dernières extensions)
 */
const STANDARD_SETS = [
  'CORE',                      // Cartes de base
  'WHIZBANGS_WORKSHOP',        // L'Atelier du Génistordu
  'WILD_WEST',                 // Rixe en Terres Ingrates
  'TITANS',                    // Les Titans
  'EMERALD_DREAM',             // Le Rêve d'Émeraude
  'PATH_OF_ARTHAS',            // La Voie d'Arthas
  'RETURN_OF_THE_LICH_KING',   // Le Retour du Roi-Liche
  'REVENDRETH',                // Meurtre au Château Nathria
  'ISLAND_VACATION',           // Vacances Insulaires
  'BATTLE_OF_THE_BANDS',       // La Bataille des Groupes
];

/**
 * Service principal pour la gestion du Deck Builder
 *
 * Gère:
 * - État réactif du deck actuel (BehaviorSubject)
 * - Ajout/suppression de cartes avec validation
 * - Calcul des statistiques en temps réel
 * - Filtrage de la collection de cartes (incluant le format Standard/Wild)
 * - Recherche par nom
 */
@Injectable({
  providedIn: 'root'
})
export class DeckBuilderService {
  // État du deck actuel
  private deckSubject = new BehaviorSubject<Deck>(this.createEmptyDeck());
  public deck$ = this.deckSubject.asObservable();

  // Filtres actifs
  private filtersSubject = new BehaviorSubject<DeckFilters>(this.getDefaultFilters());
  public filters$ = this.filtersSubject.asObservable();

  // Collection de cartes disponibles (filtrée)
  private availableCardsSubject = new BehaviorSubject<Card[]>([]);
  public availableCards$ = this.availableCardsSubject.asObservable();

  // Statistiques du deck (calculées automatiquement)
  public deckStats$: Observable<DeckStatistics> = this.deck$.pipe(
    map(deck => this.calculateDeckStats(deck)),
    distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
  );

  // État de chargement
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private cardService: CardService) {
    // Charger les cartes initiales
    this.loadAvailableCards();
  }

  /**
   * Charge les cartes disponibles avec les filtres actuels
   * Réagit aux changements de filtres ET de format du deck
   */
  private loadAvailableCards(): void {
    this.loadingSubject.next(true);

    combineLatest([
      this.cardService.getCollectibleCards(false),
      this.filters$,
      this.deck$
    ]).pipe(
      debounceTime(200)
    ).subscribe({
      next: ([allCards, filters, deck]) => {
        const filtered = this.applyFiltersToCards(allCards, filters);
        this.availableCardsSubject.next(filtered);
        this.loadingSubject.next(false);
        console.log(`📚 ${filtered.length} cartes chargées (Format: ${deck.format})`);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des cartes:', err);
        this.loadingSubject.next(false);
      }
    });
  }

  /**
   * Crée un deck vide
   */
  public createEmptyDeck(): Deck {
    return {
      id: this.generateUUID(),
      name: 'Nouveau Deck',
      heroClass: 'NEUTRAL',
      format: 'standard',
      cards: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Retourne les filtres par défaut
   */
  private getDefaultFilters(): DeckFilters {
    return {
      heroClass: [],
      manaCosts: [],
      rarities: [],
      types: [],
      mechanics: [],
      searchQuery: '',
      sets: []
    };
  }

  /**
   * Génère un UUID v4
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // ============ GESTION DU DECK ============

  /**
   * Ajoute une carte au deck (ou incrémente sa quantité)
   *
   * @param card - Carte à ajouter
   * @returns true si ajout réussi, false sinon
   */
  addCardToDeck(card: Card): boolean {
    const currentDeck = this.deckSubject.value;
    const validation = this.canAddCard(card, currentDeck);

    if (!validation.valid) {
      console.warn('❌ Impossible d\'ajouter la carte:', validation.reason);
      return false;
    }

    // Chercher si la carte existe déjà
    const existingIndex = currentDeck.cards.findIndex(dc => dc.card.id === card.id);

    let updatedCards: DeckCard[];
    if (existingIndex >= 0) {
      // Incrémenter la quantité
      updatedCards = currentDeck.cards.map((dc, index) =>
        index === existingIndex
          ? { ...dc, quantity: dc.quantity + 1 }
          : dc
      );
    } else {
      // Ajouter nouvelle carte
      updatedCards = [...currentDeck.cards, { card, quantity: 1 }];
    }

    // Mise à jour immutable
    const updatedDeck: Deck = {
      ...currentDeck,
      cards: updatedCards,
      updatedAt: new Date()
    };

    this.deckSubject.next(updatedDeck);
    console.log(`✅ Carte "${card.name}" ajoutée au deck`);
    return true;
  }

  /**
   * Retire une carte du deck (ou décrémente sa quantité)
   *
   * @param cardId - ID de la carte à retirer
   * @param removeAll - Si true, retire toutes les copies
   */
  removeCardFromDeck(cardId: string, removeAll: boolean = false): void {
    const currentDeck = this.deckSubject.value;
    const existingIndex = currentDeck.cards.findIndex(dc => dc.card.id === cardId);

    if (existingIndex < 0) {
      console.warn('⚠️ Carte non trouvée dans le deck');
      return;
    }

    let updatedCards: DeckCard[];
    const existing = currentDeck.cards[existingIndex];

    if (removeAll || existing.quantity === 1) {
      // Retirer complètement la carte
      updatedCards = currentDeck.cards.filter((_, index) => index !== existingIndex);
    } else {
      // Décrémenter la quantité
      updatedCards = currentDeck.cards.map((dc, index) =>
        index === existingIndex
          ? { ...dc, quantity: dc.quantity - 1 }
          : dc
      );
    }

    const updatedDeck: Deck = {
      ...currentDeck,
      cards: updatedCards,
      updatedAt: new Date()
    };

    this.deckSubject.next(updatedDeck);
    console.log(`🗑️ Carte "${existing.card.name}" retirée du deck`);
  }

  /**
   * Vide le deck actuel
   */
  clearDeck(): void {
    const currentDeck = this.deckSubject.value;
    const clearedDeck: Deck = {
      ...currentDeck,
      cards: [],
      updatedAt: new Date()
    };
    this.deckSubject.next(clearedDeck);
    console.log('🧹 Deck vidé');
  }

  /**
   * Charge un deck existant
   */
  loadDeck(deck: Deck): void {
    this.deckSubject.next({
      ...deck,
      updatedAt: new Date()
    });
    console.log(`📂 Deck "${deck.name}" chargé`);
  }

  /**
   * Met à jour les métadonnées du deck
   */
  updateDeckMetadata(updates: Partial<Pick<Deck, 'name' | 'heroClass' | 'format'>>): void {
    const currentDeck = this.deckSubject.value;
    const updatedDeck: Deck = {
      ...currentDeck,
      ...updates,
      updatedAt: new Date()
    };
    this.deckSubject.next(updatedDeck);
  }

  /**
   * Récupère le deck actuel (snapshot)
   */
  getCurrentDeck(): Deck {
    return this.deckSubject.value;
  }

  // ============ VALIDATION ============

  /**
   * Vérifie si une carte peut être ajoutée au deck
   */
  canAddCard(card: Card, deck: Deck): CardAddValidation {
    // Règle 1: Maximum 30 cartes
    const totalCards = deck.cards.reduce((sum, dc) => sum + dc.quantity, 0);
    if (totalCards >= 30) {
      return { valid: false, reason: 'Le deck contient déjà 30 cartes' };
    }

    // Règle 2: Vérifier si la carte existe déjà
    const existingCard = deck.cards.find(dc => dc.card.id === card.id);

    if (existingCard) {
      // Règle 3: Maximum 2 copies (1 pour légendaires)
      const isLegendary = card.elite === true || card.rarity === 'LEGENDARY';
      const maxCopies = isLegendary ? 1 : 2;

      if (existingCard.quantity >= maxCopies) {
        return {
          valid: false,
          reason: isLegendary
            ? 'Carte légendaire limitée à 1 copie'
            : 'Maximum 2 copies par carte'
        };
      }
    }

    // Règle 4: Restriction de classe
    const cardClass = card.cardClass;

    if (deck.heroClass === 'NEUTRAL') {
      // Un deck neutre ne peut contenir que des cartes neutres
      if (cardClass !== 'NEUTRAL') {
        return {
          valid: false,
          reason: `Un deck neutre ne peut contenir que des cartes neutres`
        };
      }
    } else {
      // Un deck de classe peut contenir des cartes neutres + cartes de sa classe
      if (cardClass !== 'NEUTRAL' && cardClass !== deck.heroClass) {
        return {
          valid: false,
          reason: `Carte ${CardService.translateClass(cardClass)} incompatible avec ${CardService.translateClass(deck.heroClass)}`
        };
      }
    }

    // Règle 5: Cartes collectibles uniquement
    if (card.collectible !== true) {
      return { valid: false, reason: 'Carte non collectionnable' };
    }

    return { valid: true };
  }

  /**
   * Valide un deck complet
   */
  validateDeck(deck: Deck): DeckValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    const totalCards = deck.cards.reduce((sum, dc) => sum + dc.quantity, 0);

    // Erreur: Pas 30 cartes
    if (totalCards < 30) {
      errors.push(`Le deck contient ${totalCards}/30 cartes. Ajoutez ${30 - totalCards} cartes.`);
    } else if (totalCards > 30) {
      errors.push(`Le deck contient ${totalCards}/30 cartes. Retirez ${totalCards - 30} cartes.`);
    }

    // Warning: Pas de classe sélectionnée
    if (!deck.heroClass || deck.heroClass === 'NEUTRAL') {
      warnings.push('Aucune classe sélectionnée pour le deck.');
    }

    // Warning: Analyse de la courbe de mana
    const stats = this.calculateDeckStats(deck);
    if (stats.gamePhaseDistribution.earlyPercent < 20) {
      warnings.push('Peu de cartes en début de jeu (0-3 mana). Le deck peut être lent.');
    }

    if (stats.typeDistribution.minions < 10 && totalCards === 30) {
      warnings.push('Peu de serviteurs dans le deck. Considérez ajouter plus de présence sur le terrain.');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ============ STATISTIQUES ============

  /**
   * Calcule les statistiques du deck
   */
  calculateDeckStats(deck: Deck): DeckStatistics {
    const stats: DeckStatistics = {
      totalCards: 0,
      uniqueCards: deck.cards.length,
      manaCurve: {},
      typeDistribution: {
        minions: 0,
        spells: 0,
        weapons: 0,
        locations: 0,
        heroes: 0
      },
      gamePhaseDistribution: {
        early: 0,
        mid: 0,
        late: 0,
        earlyPercent: 0,
        midPercent: 0,
        latePercent: 0
      },
      averageManaCost: 0,
      deckCompletionPercent: 0
    };

    let totalManaCost = 0;

    deck.cards.forEach(deckCard => {
      const { card, quantity } = deckCard;
      const cost = card.cost ?? 0;

      // Total cartes
      stats.totalCards += quantity;

      // Courbe de mana (regrouper 10+ ensemble)
      const manaBucket = cost >= 10 ? 10 : cost;
      stats.manaCurve[manaBucket] = (stats.manaCurve[manaBucket] || 0) + quantity;

      // Distribution par type
      const type = card.type.toUpperCase();
      if (type === 'MINION') stats.typeDistribution.minions += quantity;
      else if (type === 'SPELL') stats.typeDistribution.spells += quantity;
      else if (type === 'WEAPON') stats.typeDistribution.weapons += quantity;
      else if (type === 'LOCATION') stats.typeDistribution.locations += quantity;
      else if (type === 'HERO') stats.typeDistribution.heroes += quantity;

      // Phase de jeu
      if (cost <= 3) stats.gamePhaseDistribution.early += quantity;
      else if (cost <= 6) stats.gamePhaseDistribution.mid += quantity;
      else stats.gamePhaseDistribution.late += quantity;

      // Coût moyen
      totalManaCost += cost * quantity;
    });

    // Calcul des pourcentages
    if (stats.totalCards > 0) {
      stats.averageManaCost = Math.round((totalManaCost / stats.totalCards) * 10) / 10;
      stats.gamePhaseDistribution.earlyPercent = Math.round((stats.gamePhaseDistribution.early / stats.totalCards) * 100);
      stats.gamePhaseDistribution.midPercent = Math.round((stats.gamePhaseDistribution.mid / stats.totalCards) * 100);
      stats.gamePhaseDistribution.latePercent = Math.round((stats.gamePhaseDistribution.late / stats.totalCards) * 100);
    }

    stats.deckCompletionPercent = Math.round((stats.totalCards / 30) * 100);

    return stats;
  }

  // ============ FILTRAGE ============

  /**
   * Met à jour les filtres
   */
  updateFilters(filters: Partial<DeckFilters>): void {
    const currentFilters = this.filtersSubject.value;
    const updatedFilters: DeckFilters = {
      ...currentFilters,
      ...filters
    };
    this.filtersSubject.next(updatedFilters);
    console.log('🔍 Filtres mis à jour', updatedFilters);
  }

  /**
   * Réinitialise tous les filtres
   */
  clearFilters(): void {
    this.filtersSubject.next(this.getDefaultFilters());
    console.log('🧹 Filtres réinitialisés');
  }

  /**
   * Applique les filtres à une liste de cartes
   */
  private applyFiltersToCards(cards: Card[], filters: DeckFilters): Card[] {
    let filtered = cards;

    // Filtre par format (Standard vs Wild)
    const currentDeck = this.deckSubject.value;
    if (currentDeck.format === 'standard') {
      filtered = filtered.filter(card => STANDARD_SETS.includes(card.set));
      console.log(`🎯 Mode Standard: ${filtered.length} cartes disponibles`);
    } else {
      console.log(`🌟 Mode Wild: ${filtered.length} cartes disponibles`);
    }

    // Filtre par classe
    if (filters.heroClass.length > 0) {
      const currentDeckClass = this.deckSubject.value.heroClass;
      filtered = filtered.filter(card => {
        return card.cardClass === 'NEUTRAL' ||
               filters.heroClass.includes(card.cardClass) ||
               (currentDeckClass !== 'NEUTRAL' && card.cardClass === currentDeckClass);
      });
    }

    // Filtre par coût de mana
    if (filters.manaCosts.length > 0) {
      filtered = filtered.filter(card => {
        const cost = card.cost ?? 0;
        const bucket = cost >= 10 ? 10 : cost;
        return filters.manaCosts.includes(bucket);
      });
    }

    // Filtre par rareté
    if (filters.rarities.length > 0 && filters.rarities.length < 5) {
      filtered = filtered.filter(card =>
        card.rarity && filters.rarities.includes(card.rarity)
      );
    }

    // Filtre par type
    if (filters.types.length > 0) {
      filtered = filtered.filter(card =>
        filters.types.includes(card.type)
      );
    }

    // Filtre par mécaniques
    if (filters.mechanics.length > 0) {
      filtered = filtered.filter(card => {
        if (!card.mechanics || card.mechanics.length === 0) return false;
        return filters.mechanics.some(mechanic =>
          card.mechanics!.includes(mechanic)
        );
      });
    }

    // Filtre par extensions
    if (filters.sets.length > 0) {
      filtered = filtered.filter(card =>
        filters.sets.includes(card.set)
      );
    }

    // Recherche par nom
    if (filters.searchQuery.trim().length > 0) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(card =>
        card.name.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  /**
   * Recherche de cartes par nom
   */
  searchCards(query: string): void {
    this.updateFilters({ searchQuery: query });
  }
}
