import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DeckStorageService } from '../../../services/deck-storage.service';
import { DeckBuilderService } from '../../../services/deck-builder.service';
import { SavedDeck } from '../../../models/deck.model';
import { CardService } from '../../../services/card.service';

/**
 * Composant de gestion des decks sauvegardés
 * Affiche la liste des decks, permet de charger, supprimer, renommer
 */
@Component({
  selector: 'app-deck-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './deck-manager.component.html',
  styleUrl: './deck-manager.component.scss'
})
export class DeckManagerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @Output() closeManager = new EventEmitter<void>();

  savedDecks: SavedDeck[] = [];
  filteredDecks: SavedDeck[] = [];
  searchQuery: string = '';
  selectedDeckId: string | null = null;
  editingDeckId: string | null = null;
  editingDeckName: string = '';

  // Tri
  sortBy: 'name' | 'date' | 'class' = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';

  constructor(
    private deckStorageService: DeckStorageService,
    private deckBuilderService: DeckBuilderService
  ) {}

  ngOnInit(): void {
    this.loadDecks();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charge tous les decks sauvegardés
   */
  loadDecks(): void {
    this.savedDecks = this.deckStorageService.loadDecks();
    this.applyFiltersAndSort();
  }

  /**
   * Applique la recherche et le tri
   */
  applyFiltersAndSort(): void {
    let decks = [...this.savedDecks];

    // Recherche
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      decks = decks.filter(deck =>
        deck.name.toLowerCase().includes(query) ||
        deck.heroClass.toLowerCase().includes(query)
      );
    }

    // Tri
    decks.sort((a, b) => {
      let comparison = 0;

      switch (this.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'class':
          comparison = a.heroClass.localeCompare(b.heroClass);
          break;
      }

      return this.sortOrder === 'asc' ? comparison : -comparison;
    });

    this.filteredDecks = decks;
  }

  /**
   * Gère la recherche
   */
  onSearchChange(): void {
    this.applyFiltersAndSort();
  }

  /**
   * Change le tri
   */
  changeSortBy(sortBy: 'name' | 'date' | 'class'): void {
    if (this.sortBy === sortBy) {
      // Toggle order
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortBy;
      this.sortOrder = sortBy === 'date' ? 'desc' : 'asc';
    }
    this.applyFiltersAndSort();
  }

  /**
   * Sélectionne un deck
   */
  selectDeck(deckId: string): void {
    this.selectedDeckId = this.selectedDeckId === deckId ? null : deckId;
  }

  /**
   * Charge un deck dans le builder
   */
  loadDeck(deck: SavedDeck): void {
    if (confirm(`Charger le deck "${deck.name}" ?\n\nLes modifications non sauvegardées du deck actuel seront perdues.`)) {
      this.deckBuilderService.loadDeck(deck);
      this.closeManager.emit();
    }
  }

  /**
   * Commence l'édition du nom d'un deck
   */
  startEditDeckName(deck: SavedDeck): void {
    this.editingDeckId = deck.id;
    this.editingDeckName = deck.name;
  }

  /**
   * Annule l'édition
   */
  cancelEditDeckName(): void {
    this.editingDeckId = null;
    this.editingDeckName = '';
  }

  /**
   * Sauvegarde le nouveau nom
   */
  saveDeckName(deck: SavedDeck): void {
    if (!this.editingDeckName.trim()) {
      alert('Le nom du deck ne peut pas être vide');
      return;
    }

    this.deckStorageService.updateDeck(deck.id, { name: this.editingDeckName.trim() });
    this.loadDecks();
    this.editingDeckId = null;
    this.editingDeckName = '';
  }

  /**
   * Supprime un deck
   */
  deleteDeck(deck: SavedDeck, event: Event): void {
    event.stopPropagation();

    if (confirm(`Êtes-vous sûr de vouloir supprimer le deck "${deck.name}" ?\n\nCette action est irréversible.`)) {
      this.deckStorageService.deleteDeck(deck.id);
      this.loadDecks();
      if (this.selectedDeckId === deck.id) {
        this.selectedDeckId = null;
      }
    }
  }

  /**
   * Crée un nouveau deck vide
   */
  createNewDeck(): void {
    const newDeck = this.deckBuilderService.createEmptyDeck();
    this.deckBuilderService.loadDeck(newDeck);
    this.closeManager.emit();
  }

  /**
   * Obtient le nom traduit d'une classe
   */
  getClassName(classCode: string): string {
    return CardService.translateClass(classCode);
  }

  /**
   * Obtient l'icône d'une classe
   */
  getClassIcon(classCode: string): string {
    const icons: { [key: string]: string } = {
      'NEUTRAL': '⚪',
      'MAGE': '🔮',
      'WARRIOR': '⚔️',
      'PALADIN': '🛡️',
      'HUNTER': '🏹',
      'ROGUE': '🗡️',
      'PRIEST': '✨',
      'SHAMAN': '⚡',
      'WARLOCK': '🔥',
      'DRUID': '🌿',
      'DEMONHUNTER': '😈',
      'DEATHKNIGHT': '💀'
    };
    return icons[classCode] || '⚪';
  }

  /**
   * Formate une date
   */
  formatDate(date: Date): string {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;

    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  /**
   * Obtient les informations de stockage
   */
  getStorageInfo(): string {
    const info = this.deckStorageService.getStorageInfo();
    return `${info.count}/${info.limit} decks`;
  }

  /**
   * Ferme le gestionnaire
   */
  close(): void {
    this.closeManager.emit();
  }
}
