import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DeckBuilderService } from '../../services/deck-builder.service';
import { DeckCodeService } from '../../services/deck-code.service';
import { DeckStorageService } from '../../services/deck-storage.service';
import { CardService } from '../../services/card.service';
import { Deck, DeckStatistics, SavedDeck } from '../../models/deck.model';
import { CardCollectionComponent } from './card-collection/card-collection.component';
import { DeckStatsComponent } from './deck-stats/deck-stats.component';
import { CardFilterComponent } from './card-filter/card-filter.component';
import { DeckManagerComponent } from './deck-manager/deck-manager.component';

@Component({
  selector: 'app-deck-builder',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardCollectionComponent,
    DeckStatsComponent,
    CardFilterComponent,
    DeckManagerComponent
  ],
  templateUrl: './deck-builder.component.html',
  styleUrl: './deck-builder.component.scss'
})
export class DeckBuilderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Exposer le service pour utilisation dans le template
  public deckBuilderService: DeckBuilderService;

  // Observables du service
  deck$;
  deckStats$;
  availableCards$;
  loading$;

  // État local
  currentDeck: Deck | null = null;
  currentStats: DeckStatistics | null = null;
  deckName: string = 'Nouveau Deck';
  selectedClass: string = 'MAGE'; // Classe par défaut: Mage
  selectedFormat: 'standard' | 'wild' = 'standard';
  showExportModal: boolean = false;
  showImportModal: boolean = false;
  showSaveModal: boolean = false;
  showDeckManager: boolean = false;
  exportedCode: string = '';
  importCode: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  // Options de classes (sans Neutre)
  readonly classes = [
    { code: 'MAGE', name: 'Mage', icon: '🔮' },
    { code: 'WARRIOR', name: 'Guerrier', icon: '⚔️' },
    { code: 'PALADIN', name: 'Paladin', icon: '🛡️' },
    { code: 'HUNTER', name: 'Chasseur', icon: '🏹' },
    { code: 'ROGUE', name: 'Voleur', icon: '🗡️' },
    { code: 'PRIEST', name: 'Prêtre', icon: '✨' },
    { code: 'SHAMAN', name: 'Chaman', icon: '⚡' },
    { code: 'WARLOCK', name: 'Démoniste', icon: '🔥' },
    { code: 'DRUID', name: 'Druide', icon: '🌿' },
    { code: 'DEMONHUNTER', name: 'Chasseur de démons', icon: '😈' },
    { code: 'DEATHKNIGHT', name: 'Chevalier de la mort', icon: '💀' }
  ];

  constructor(
    deckBuilderService: DeckBuilderService,
    private deckCodeService: DeckCodeService,
    private deckStorageService: DeckStorageService,
    private cardService: CardService
  ) {
    this.deckBuilderService = deckBuilderService;
    // Initialiser les observables après l'injection
    this.deck$ = this.deckBuilderService.deck$;
    this.deckStats$ = this.deckBuilderService.deckStats$;
    this.availableCards$ = this.deckBuilderService.availableCards$;
    this.loading$ = this.deckBuilderService.loading$;
  }

  ngOnInit(): void {
    console.log('🎴 Deck Builder initialisé');

    // S'abonner au deck actuel
    this.deck$.pipe(takeUntil(this.destroy$)).subscribe(deck => {
      this.currentDeck = deck;
      this.deckName = deck.name;
      this.selectedClass = deck.heroClass;
      this.selectedFormat = deck.format;
    });

    // S'abonner aux statistiques
    this.deckStats$.pipe(takeUntil(this.destroy$)).subscribe(stats => {
      this.currentStats = stats;
    });

    // Appliquer le filtre initial pour la classe Mage
    this.deckBuilderService.updateFilters({
      heroClass: ['MAGE', 'NEUTRAL'],
      manaCosts: [],
      rarities: [],
      types: [],
      mechanics: [],
      searchQuery: '',
      sets: []
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ============ GESTION DU DECK ============

  /**
   * Met à jour le nom du deck
   */
  onDeckNameChange(): void {
    this.deckBuilderService.updateDeckMetadata({ name: this.deckName });
  }

  /**
   * Change la classe du deck
   */
  onClassChange(): void {
    this.deckBuilderService.updateDeckMetadata({ heroClass: this.selectedClass });

    // Appliquer un filtre pour afficher seulement les cartes de cette classe + neutres
    this.deckBuilderService.updateFilters({
      heroClass: [this.selectedClass, 'NEUTRAL'],
      manaCosts: [],
      rarities: [],
      types: [],
      mechanics: [],
      searchQuery: '',
      sets: []
    });

    this.showSuccess(`Classe changée : ${this.getClassName(this.selectedClass)}`);
  }

  /**
   * Change le format du deck
   */
  onFormatChange(): void {
    this.deckBuilderService.updateDeckMetadata({ format: this.selectedFormat });
    this.showSuccess(`Format changé : ${this.selectedFormat === 'standard' ? 'Standard' : 'Libre'}`);
  }

  /**
   * Vide le deck actuel
   */
  clearDeck(): void {
    if (confirm('Êtes-vous sûr de vouloir vider le deck ?')) {
      this.deckBuilderService.clearDeck();
      this.showSuccess('Deck vidé');
    }
  }

  /**
   * Crée un nouveau deck
   */
  newDeck(): void {
    if (this.currentStats && this.currentStats.totalCards > 0) {
      if (!confirm('Créer un nouveau deck ? Les modifications non sauvegardées seront perdues.')) {
        return;
      }
    }

    this.deckBuilderService.loadDeck({
      id: this.generateUUID(),
      name: 'Nouveau Deck',
      heroClass: 'MAGE',
      format: 'standard',
      cards: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Appliquer le filtre pour la classe Mage
    this.deckBuilderService.updateFilters({
      heroClass: ['MAGE', 'NEUTRAL'],
      manaCosts: [],
      rarities: [],
      types: [],
      mechanics: [],
      searchQuery: '',
      sets: []
    });

    this.showSuccess('Nouveau deck créé');
  }

  // ============ SAUVEGARDE ============

  /**
   * Sauvegarde le deck actuel (même s'il est incomplet)
   */
  saveDeck(): void {
    if (!this.currentDeck) return;

    try {
      // Générer le deck code seulement si le deck est complet
      let deckCode = '';
      const totalCards = this.currentDeck.cards.reduce((sum, dc) => sum + dc.quantity, 0);

      if (totalCards === 30) {
        try {
          deckCode = this.deckCodeService.encodeDeck(this.currentDeck);
        } catch (error) {
          console.warn('Impossible de générer le code deck:', error);
        }
      }

      const savedDeck: SavedDeck = {
        ...this.currentDeck,
        deckCode
      };

      this.deckStorageService.saveDeck(savedDeck);
      this.showSuccess(`Deck "${this.deckName}" sauvegardé ! (${totalCards}/30 cartes)`);
    } catch (error: any) {
      this.showError('Erreur lors de la sauvegarde : ' + error.message);
    }
  }

  // ============ EXPORT / IMPORT ============

  /**
   * Ouvre le modal d'export
   */
  openExportModal(): void {
    if (!this.currentDeck) return;

    const validation = this.deckBuilderService.validateDeck(this.currentDeck);
    if (!validation.valid) {
      this.showError('Le deck doit contenir exactement 30 cartes pour être exporté');
      return;
    }

    try {
      this.exportedCode = this.deckCodeService.encodeDeck(this.currentDeck);
      this.showExportModal = true;
    } catch (error: any) {
      this.showError('Erreur lors de l\'export : ' + error.message);
    }
  }

  /**
   * Copie le code du deck dans le presse-papier
   */
  copyDeckCode(): void {
    if (!this.exportedCode) return;

    navigator.clipboard.writeText(this.exportedCode).then(() => {
      this.showSuccess('Code copié dans le presse-papier !');
    }).catch(err => {
      console.error('Erreur lors de la copie:', err);
      this.showError('Impossible de copier le code');
    });
  }

  /**
   * Ouvre le modal d'import
   */
  openImportModal(): void {
    this.importCode = '';
    this.showImportModal = true;
  }

  /**
   * Importe un deck depuis un code
   */
  importDeck(): void {
    if (!this.importCode.trim()) {
      this.showError('Veuillez entrer un code de deck');
      return;
    }

    try {
      const decoded = this.deckCodeService.decodeDeck(this.importCode);
      if (!decoded) {
        this.showError('Code de deck invalide');
        return;
      }

      // TODO: Récupérer les cartes complètes depuis CardService
      // Pour l'instant, afficher un message
      this.showSuccess('Import réussi ! (Fonctionnalité complète à venir)');
      this.showImportModal = false;

      console.log('Deck décodé:', decoded);
    } catch (error: any) {
      this.showError('Erreur lors de l\'import : ' + error.message);
    }
  }

  /**
   * Ouvre le gestionnaire de decks
   */
  openDeckManager(): void {
    this.showDeckManager = true;
  }

  /**
   * Ferme le gestionnaire de decks
   */
  closeDeckManager(): void {
    this.showDeckManager = false;
  }

  /**
   * Ferme les modals
   */
  closeModals(): void {
    this.showExportModal = false;
    this.showImportModal = false;
    this.showSaveModal = false;
    this.showDeckManager = false;
    this.exportedCode = '';
    this.importCode = '';
  }

  // ============ UTILITAIRES ============

  /**
   * Récupère le nom traduit d'une classe
   */
  getClassName(classCode: string): string {
    return CardService.translateClass(classCode);
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

  /**
   * Affiche un message de succès
   */
  private showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  /**
   * Affiche un message d'erreur
   */
  private showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }

  /**
   * Récupère les informations de stockage
   */
  getStorageInfo(): string {
    const info = this.deckStorageService.getStorageInfo();
    return `${info.count}/${info.limit} decks sauvegardés`;
  }
}
