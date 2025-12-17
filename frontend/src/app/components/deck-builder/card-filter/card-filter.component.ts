import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { DeckBuilderService } from '../../../services/deck-builder.service';
import { DeckFilters, MECHANICS } from '../../../models/deck.model';
import { CardService } from '../../../services/card.service';

/**
 * Composant de filtrage avancé pour la collection de cartes
 */
@Component({
  selector: 'app-card-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './card-filter.component.html',
  styleUrl: './card-filter.component.scss'
})
export class CardFilterComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // Filtres actuels
  filters: DeckFilters = {
    heroClass: [],
    manaCosts: [],
    rarities: [],
    types: [],
    mechanics: [],
    searchQuery: '',
    sets: []
  };

  // Options disponibles
  readonly classes = [
    { code: 'NEUTRAL', name: 'Neutral', icon: 'assets/icons/hs-icons-master/SVG/Misc_BattleNet.svg' },
    { code: 'MAGE', name: 'Mage', icon: 'assets/icons/hs-icons-master/SVG/Class_Mage.svg' },
    { code: 'WARRIOR', name: 'Warrior', icon: 'assets/icons/hs-icons-master/SVG/Class_Warrior.svg' },
    { code: 'PALADIN', name: 'Paladin', icon: 'assets/icons/hs-icons-master/SVG/Class_Paladin.svg' },
    { code: 'HUNTER', name: 'Hunter', icon: 'assets/icons/hs-icons-master/SVG/Class_Hunter.svg' },
    { code: 'ROGUE', name: 'Rogue', icon: 'assets/icons/hs-icons-master/SVG/Class_Rogue.svg' },
    { code: 'PRIEST', name: 'Priest', icon: 'assets/icons/hs-icons-master/SVG/Class_Priest.svg' },
    { code: 'SHAMAN', name: 'Shaman', icon: 'assets/icons/hs-icons-master/SVG/Class_Shaman.svg' },
    { code: 'WARLOCK', name: 'Warlock', icon: 'assets/icons/hs-icons-master/SVG/Class_Warlock.svg' },
    { code: 'DRUID', name: 'Druid', icon: 'assets/icons/hs-icons-master/SVG/Class_Druid.svg' },
    { code: 'DEMONHUNTER', name: 'Demon Hunter', icon: 'assets/icons/hs-icons-master/SVG/Class_DemonHunter.svg' },
    { code: 'DEATHKNIGHT', name: 'Death Knight', icon: 'assets/icons/hs-icons-master/SVG/Mode_Duels.svg' } // Using Mode_Duels as a placeholder for Death Knight
  ];

  readonly manaCosts = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // 10 = 10+

  readonly rarities = [
    { code: 'FREE', name: 'Gratuite' },
    { code: 'COMMON', name: 'Commune' },
    { code: 'RARE', name: 'Rare' },
    { code: 'EPIC', name: 'Épique' },
    { code: 'LEGENDARY', name: 'Légendaire' }
  ];

  readonly types = [
    { code: 'MINION', name: 'Minion', icon: '' },
    { code: 'SPELL', name: 'Spell', icon: '' },
    { code: 'WEAPON', name: 'Weapon', icon: '' },
    { code: 'LOCATION', name: 'Location', icon: '' }
  ];

  readonly mechanics = MECHANICS.map(m => ({
    code: m,
    name: this.formatMechanicName(m)
  }));

  // État de l'UI
  showMechanics = true;

  constructor(private deckBuilderService: DeckBuilderService) {}

  ngOnInit(): void {
    // Setup de la recherche avec debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.filters.searchQuery = query;
      this.applyFilters();
    });

    // Charger les filtres actuels
    this.deckBuilderService.filters$
      .pipe(takeUntil(this.destroy$))
      .subscribe(filters => {
        this.filters = { ...filters };
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Gère la recherche par nom
   */
  onSearchInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchSubject.next(query);
  }

  /**
   * Toggle une classe dans les filtres
   */
  toggleClass(classCode: string): void {
    const index = this.filters.heroClass.indexOf(classCode);
    if (index >= 0) {
      this.filters.heroClass.splice(index, 1);
    } else {
      this.filters.heroClass.push(classCode);
    }
    this.applyFilters();
  }

  /**
   * Toggle un coût de mana
   */
  toggleManaCost(cost: number): void {
    const index = this.filters.manaCosts.indexOf(cost);
    if (index >= 0) {
      this.filters.manaCosts.splice(index, 1);
    } else {
      this.filters.manaCosts.push(cost);
    }
    this.applyFilters();
  }

  /**
   * Toggle une rareté
   */
  toggleRarity(rarity: string): void {
    const index = this.filters.rarities.indexOf(rarity);
    if (index >= 0) {
      this.filters.rarities.splice(index, 1);
    } else {
      this.filters.rarities.push(rarity);
    }
    this.applyFilters();
  }

  /**
   * Toggle un type de carte
   */
  toggleType(type: string): void {
    const index = this.filters.types.indexOf(type);
    if (index >= 0) {
      this.filters.types.splice(index, 1);
    } else {
      this.filters.types.push(type);
    }
    this.applyFilters();
  }

  /**
   * Toggle une mécanique
   */
  toggleMechanic(mechanic: string): void {
    const index = this.filters.mechanics.indexOf(mechanic);
    if (index >= 0) {
      this.filters.mechanics.splice(index, 1);
    } else {
      this.filters.mechanics.push(mechanic);
    }
    this.applyFilters();
  }

  /**
   * Vérifie si une classe est sélectionnée
   */
  isClassSelected(classCode: string): boolean {
    return this.filters.heroClass.includes(classCode);
  }

  /**
   * Vérifie si un coût de mana est sélectionné
   */
  isManaCostSelected(cost: number): boolean {
    return this.filters.manaCosts.includes(cost);
  }

  /**
   * Vérifie si une rareté est sélectionnée
   */
  isRaritySelected(rarity: string): boolean {
    return this.filters.rarities.includes(rarity);
  }

  /**
   * Vérifie si un type est sélectionné
   */
  isTypeSelected(type: string): boolean {
    return this.filters.types.includes(type);
  }

  /**
   * Vérifie si une mécanique est sélectionnée
   */
  isMechanicSelected(mechanic: string): boolean {
    return this.filters.mechanics.includes(mechanic);
  }

  /**
   * Réinitialise tous les filtres
   */
  clearAllFilters(): void {
    this.filters = {
      heroClass: [],
      manaCosts: [],
      rarities: [],
      types: [],
      mechanics: [],
      searchQuery: '',
      sets: []
    };
    this.deckBuilderService.clearFilters();
  }

  /**
   * Applique les filtres au service
   */
  private applyFilters(): void {
    this.deckBuilderService.updateFilters(this.filters);
  }

  /**
   * Retourne le nombre total de filtres actifs
   */
  get activeFiltersCount(): number {
    return this.filters.heroClass.length +
           this.filters.manaCosts.length +
           this.filters.rarities.length +
           this.filters.types.length +
           this.filters.mechanics.length +
           (this.filters.searchQuery ? 1 : 0);
  }

  /**
   * Retourne le label pour un coût de mana
   */
  getManaCostLabel(cost: number): string {
    return cost === 10 ? '10+' : cost.toString();
  }

  /**
   * Formate le nom d'une mécanique
   */
  private formatMechanicName(mechanic: string): string {
    return mechanic
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  }
}
