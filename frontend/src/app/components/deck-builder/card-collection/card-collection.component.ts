import { Component, Input, OnInit, OnChanges, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeckCardItemComponent } from '../deck-card-item/deck-card-item.component';
import { Card } from '../../../models/card.model';
import { DeckBuilderService } from '../../../services/deck-builder.service';

/**
 * Composant d'affichage de la collection de cartes
 * Cliquez sur une carte pour l'ajouter au deck
 */
@Component({
  selector: 'app-card-collection',
  standalone: true,
  imports: [
    CommonModule,
    DeckCardItemComponent
  ],
  templateUrl: './card-collection.component.html',
  styleUrl: './card-collection.component.scss'
})
export class CardCollectionComponent implements OnInit, OnChanges {
  @Input() cards: Card[] = [];
  @Input() loading: boolean = false;
  @ViewChild('scrollContainer') scrollContainer?: ElementRef;

  // Pagination
  displayedCards: Card[] = [];
  private pageSize = 30;
  currentPage = 0;
  totalPages = 0;

  constructor(private deckBuilderService: DeckBuilderService) {
  }

  ngOnInit(): void {
    this.updatePagination();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cards'] && !changes['cards'].firstChange) {
      this.currentPage = 0;
      this.updatePagination();
    }
  }

  /**
   * Met à jour la pagination
   */
  private updatePagination(): void {
    this.totalPages = Math.ceil(this.cards.length / this.pageSize);
    this.loadPage();
  }

  /**
   * Charge une page spécifique
   */
  private loadPage(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedCards = this.cards.slice(startIndex, endIndex);
  }

  /**
   * Page suivante
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadPage();
    }
  }

  /**
   * Page précédente
   */
  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadPage();
    }
  }

  /**
   * Va à une page spécifique
   */
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadPage();
    }
  }

  /**
   * Indique s'il y a une page suivante
   */
  get hasNextPage(): boolean {
    return this.currentPage < this.totalPages - 1;
  }

  /**
   * Indique s'il y a une page précédente
   */
  get hasPreviousPage(): boolean {
    return this.currentPage > 0;
  }

  /**
   * Gère le clic sur une carte (ajout au deck)
   */
  onCardClick(card: Card): void {
    if (!this.deckBuilderService) {
      return;
    }

    this.deckBuilderService.addCardToDeck(card);
  }

  /**
   * TrackBy function pour optimiser les performances
   */
  trackByCardId(index: number, card: Card): string {
    return card.id;
  }
}
