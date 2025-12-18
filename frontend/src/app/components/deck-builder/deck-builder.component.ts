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
  deckName: string = 'New Deck';
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
    { code: 'WARRIOR', name: 'Warrior', icon: '⚔️' },
    { code: 'PALADIN', name: 'Paladin', icon: '🛡️' },
    { code: 'HUNTER', name: 'Hunter', icon: '🏹' },
    { code: 'ROGUE', name: 'Rogue', icon: '🗡️' },
    { code: 'PRIEST', name: 'Priest', icon: '✨' },
    { code: 'SHAMAN', name: 'Shaman', icon: '⚡' },
    { code: 'WARLOCK', name: 'Warlock', icon: '🔥' },
    { code: 'DRUID', name: 'Druid', icon: '🌿' },
    { code: 'DEMONHUNTER', name: 'Demon Hunter', icon: '😈' },
    { code: 'DEATHKNIGHT', name: 'Death Knight', icon: '💀' }
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

    // S'assurer que la classe par défaut est MAGE
    if (this.selectedClass !== 'MAGE') {
      this.deckBuilderService.updateDeckMetadata({ heroClass: 'MAGE' });
    }

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

    this.showSuccess(`Class changed: ${this.getClassName(this.selectedClass)}`);
  }

  /**
   * Change le format du deck
   */
  onFormatChange(): void {
    this.deckBuilderService.updateDeckMetadata({ format: this.selectedFormat });
    this.showSuccess(`Format changed : ${this.selectedFormat === 'standard' ? 'Standard' : 'Wild'}`);
  }

  /**
   * Vide le deck actuel
   */
  clearDeck(): void {
    this.deckBuilderService.clearDeck();
    this.showSuccess('Deck cleared');
  }

  /**
   * Crée un nouveau deck
   */
  newDeck(): void {
    if (this.currentStats && this.currentStats.totalCards > 0) {
      // Allow creating a new deck without confirmation
    }

    this.deckBuilderService.loadDeck({
      id: this.generateUUID(),
      name: 'New Deck',
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

    this.showSuccess('New deck created');
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
        }
      }

      const savedDeck: SavedDeck = {
        ...this.currentDeck,
        deckCode
      };

      this.deckStorageService.saveDeck(savedDeck);
      this.showSuccess(`Deck "${this.deckName}" saved! (${totalCards}/30 cards)`);
    } catch (error: any) {
      this.showError('Error saving deck: ' + error.message);
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
      this.showError('The deck must contain exactly 30 cards to be exported');
      return;
    }

    try {
      this.exportedCode = this.deckCodeService.encodeDeck(this.currentDeck);
      this.showExportModal = true;
    } catch (error: any) {
      this.showError('Error during export: ' + error.message);
    }
  }

  /**
   * Copie le code du deck dans le presse-papier
   */
  copyDeckCode(): void {
    if (!this.exportedCode) return;

    navigator.clipboard.writeText(this.exportedCode).then(() => {
      this.showSuccess('Code copied to clipboard!');
    }).catch(err => {
      this.showError('Unable to copy code');
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
      this.showError('Please enter a deck code');
      return;
    }

    // Extraire le nom du deck si disponible
    const extractedName = this.extractDeckName(this.importCode);

    // Extraire le code deck du texte (peut contenir des commentaires et autres infos)
    const deckCode = this.extractDeckCode(this.importCode);
    if (!deckCode) {
      this.showError('No valid deck code found in the text');
      return;
    }

    try {
      const decoded = this.deckCodeService.decodeDeck(deckCode);
      if (!decoded) {
        this.showError('Invalid deck code');
        return;
      }

      // Collecter tous les DBF IDs avec leurs quantités
      const allDbfIds: number[] = [];
      const cardQuantities = new Map<number, number>();

      // Cartes single copy
      decoded.singleCopyDbfIds.forEach(dbfId => {
        allDbfIds.push(dbfId);
        cardQuantities.set(dbfId, 1);
      });

      // Cartes double copy
      decoded.doubleCopyDbfIds.forEach(dbfId => {
        allDbfIds.push(dbfId);
        cardQuantities.set(dbfId, 2);
      });

      // Cartes N-copy
      decoded.nCopyCards.forEach(({ dbfId, count }) => {
        allDbfIds.push(dbfId);
        cardQuantities.set(dbfId, count);
      });

      // Retrieve full cards from CardService
      this.cardService.getCardsByDbfIds(allDbfIds).subscribe({
        next: (cards) => {
          if (cards.length === 0) {
            this.showError(`No cards found in the database for this deck. DBF IDs: ${allDbfIds.join(', ')}`);
            return;
          }

          if (cards.length < allDbfIds.length) {
            const foundIds = new Set(cards.map(c => c.dbfId));
            const missingIds = allDbfIds.filter(id => !foundIds.has(id));
          }

          // Build the deck with cards and their quantities
          const deckCards: any[] = cards.map(card => ({
            card,
            quantity: cardQuantities.get(card.dbfId) || 1
          }));

          // Utiliser le nom extrait ou générer un nom par défaut
          const deckName = extractedName || `Imported Deck - ${this.getClassName(decoded.heroClass)}`;

          // Créer le nouveau deck
          const importedDeck: Deck = {
            id: this.generateUUID(),
            name: deckName,
            heroClass: decoded.heroClass,
            format: decoded.format,
            cards: deckCards,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          // Charger le deck importé
          this.deckBuilderService.loadDeck(importedDeck);

          // La subscription dans ngOnInit va mettre à jour automatiquement selectedClass et selectedFormat
          // Pas besoin de les mettre à jour manuellement ici

          // Appliquer les filtres pour la classe importée
          this.deckBuilderService.updateFilters({
            heroClass: [importedDeck.heroClass, 'NEUTRAL'],
            manaCosts: [],
            rarities: [],
            types: [],
            mechanics: [],
            searchQuery: '',
            sets: []
          });

          const totalCards = deckCards.reduce((sum, dc) => sum + dc.quantity, 0);
          const missingCount = allDbfIds.length - cards.length;

          if (missingCount > 0) {
            this.showSuccess(`Deck "${deckName}" importé avec ${totalCards} cartes (${missingCount} cartes manquantes)`);
          } else {
            this.showSuccess(`Deck "${deckName}" importé avec succès ! (${totalCards}/30 cartes)`);
          }

          this.showImportModal = false;
        },
        error: (err) => {
          this.showError('Erreur lors de la récupération des cartes: ' + err.message);
        }
      });

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
   * Extrait le nom du deck d'un texte (format export Hearthstone)
   * Le nom est sur la première ligne après "###"
   */
  private extractDeckName(text: string): string | null {
    const lines = text.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      // Format Hearthstone: ### NomDuDeck
      if (trimmedLine.startsWith('###')) {
        const name = trimmedLine.substring(3).trim();
        if (name.length > 0) {
          return name;
        }
      }
    }
    return null;
  }

  /**
   * Extrait le code deck d'un texte (peut contenir l'export complet Hearthstone)
   */
  private extractDeckCode(text: string): string | null {
    // Supprimer les espaces/retours à la ligne au début et à la fin
    text = text.trim();

    // Si c'est déjà juste un code (commence par AAE), le retourner
    if (/^AAE[A-Za-z0-9+/=]+$/.test(text)) {
      return text;
    }

    // Sinon, chercher le code dans le texte (ligne qui commence par AAE)
    const lines = text.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      // Le code deck Hearthstone commence toujours par "AAE"
      if (/^AAE[A-Za-z0-9+/=]+$/.test(trimmedLine)) {
        return trimmedLine;
      }
    }

    // Si pas trouvé, essayer de trouver une séquence AAE... n'importe où
    const match = text.match(/AAE[A-Za-z0-9+/=]+/);
    if (match) {
      return match[0];
    }

    return null;
  }

  /**
   * Récupère le nom traduit d'une classe
   */
  getClassName(classCode: string): string {
    const classInfo = this.classes.find(c => c.code === classCode);
    return classInfo ? classInfo.name : classCode;
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
    return `${info.count}/${info.limit} decks saved`;
  }
}
