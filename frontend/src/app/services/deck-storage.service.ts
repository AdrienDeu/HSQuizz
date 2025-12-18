import { Injectable } from '@angular/core';
import { SavedDeck, StorageSchema } from '../models/deck.model';

/**
 * Service pour la gestion du stockage des decks dans LocalStorage
 *
 * Gère la persistance des decks sauvegardés avec:
 * - CRUD operations (Create, Read, Update, Delete)
 * - Gestion des erreurs (quota exceeded)
 * - Versioning pour migrations futures
 */
@Injectable({
  providedIn: 'root'
})
export class DeckStorageService {
  private readonly STORAGE_KEY = 'hsquizz_decks';
  private readonly STORAGE_VERSION = '1.0';
  private readonly MAX_DECKS = 50; // Limite pour éviter quota exceeded

  constructor() {}

  /**
   * Sauvegarde tous les decks dans localStorage
   *
   * @param decks - Tableau de decks à sauvegarder
   */
  saveDecks(decks: SavedDeck[]): void {
    const data: StorageSchema = {
      version: this.STORAGE_VERSION,
      decks: decks,
      lastModified: Date.now()
    };

    try {
      const json = JSON.stringify(data);
      localStorage.setItem(this.STORAGE_KEY, json);
    } catch (error: any) {
      this.handleStorageError(error);
      throw error;
    }
  }

  /**
   * Charge tous les decks depuis localStorage
   *
   * @returns Tableau de decks sauvegardés (vide si aucun ou erreur)
   */
  loadDecks(): SavedDeck[] {
    try {
      const json = localStorage.getItem(this.STORAGE_KEY);
      if (!json) {
        return [];
      }

      const data: StorageSchema = JSON.parse(json);

      // Migration de version si nécessaire
      if (data.version !== this.STORAGE_VERSION) {
        return this.migrateDecks(data);
      }

      // Convertir les dates de string vers Date
      const decks = data.decks.map(deck => ({
        ...deck,
        createdAt: new Date(deck.createdAt),
        updatedAt: new Date(deck.updatedAt)
      }));

      return decks;
    } catch (error) {
      return [];
    }
  }

  /**
   * Sauvegarde un deck unique (ajout ou mise à jour)
   *
   * @param deck - Deck à sauvegarder
   */
  saveDeck(deck: SavedDeck): void {
    const decks = this.loadDecks();
    const index = decks.findIndex(d => d.id === deck.id);

    if (index >= 0) {
      // Mise à jour d'un deck existant
      decks[index] = deck;
    } else {
      // Ajout d'un nouveau deck
      if (decks.length >= this.MAX_DECKS) {
        throw new Error(`Limite de ${this.MAX_DECKS} decks atteinte. Supprimez des decks pour en ajouter de nouveaux.`);
      }
      decks.push(deck);
    }

    this.saveDecks(decks);
  }

  /**
   * Supprime un deck par son ID
   *
   * @param deckId - ID du deck à supprimer
   */
  deleteDeck(deckId: string): void {
    const decks = this.loadDecks();
    const filtered = decks.filter(d => d.id !== deckId);

    if (filtered.length === decks.length) {
      return;
    }

    this.saveDecks(filtered);
  }

  /**
   * Récupère un deck par son ID
   *
   * @param deckId - ID du deck recherché
   * @returns Deck trouvé ou null
   */
  getDeck(deckId: string): SavedDeck | null {
    const decks = this.loadDecks();
    const deck = decks.find(d => d.id === deckId);
    return deck || null;
  }

  /**
   * Met à jour un deck existant
   *
   * @param deckId - ID du deck à mettre à jour
   * @param updates - Modifications partielles à appliquer
   */
  updateDeck(deckId: string, updates: Partial<SavedDeck>): void {
    const decks = this.loadDecks();
    const index = decks.findIndex(d => d.id === deckId);

    if (index < 0) {
      return;
    }

    decks[index] = {
      ...decks[index],
      ...updates,
      updatedAt: new Date()
    };

    this.saveDecks(decks);
  }

  /**
   * Supprime tous les decks
   */
  clearAllDecks(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Retourne la taille du stockage en bytes
   *
   * @returns Taille en bytes
   */
  getStorageSize(): number {
    const json = localStorage.getItem(this.STORAGE_KEY);
    return json ? new Blob([json]).size : 0;
  }

  /**
   * Retourne le nombre de decks sauvegardés
   *
   * @returns Nombre de decks
   */
  getDeckCount(): number {
    return this.loadDecks().length;
  }

  /**
   * Vérifie si la limite de decks est atteinte
   *
   * @returns true si la limite est atteinte
   */
  isLimitReached(): boolean {
    return this.getDeckCount() >= this.MAX_DECKS;
  }

  /**
   * Retourne les informations de stockage
   *
   * @returns Infos de stockage
   */
  getStorageInfo(): { count: number; size: number; limit: number; sizePercent: number } {
    const count = this.getDeckCount();
    const size = this.getStorageSize();
    const limit = this.MAX_DECKS;
    const sizePercent = Math.round((count / limit) * 100);

    return { count, size, limit, sizePercent };
  }

  /**
   * Gère les erreurs de stockage
   */
  private handleStorageError(error: any): void {
    if (error.name === 'QuotaExceededError') {
      // Optionnel: Supprimer automatiquement les decks les plus anciens
      // this.cleanupOldDecks();
    } else if (error.name === 'SecurityError') {
    } else {
    }
  }

  /**
   * Migre les decks d'une ancienne version vers la version actuelle
   */
  private migrateDecks(data: any): SavedDeck[] {
    // Pour l'instant, pas de migration nécessaire (version 1.0)
    // Dans le futur, ajouter la logique de migration ici

    try {
      return data.decks || [];
    } catch {
      return [];
    }
  }

  /**
   * Nettoie les decks les plus anciens (optionnel)
   * Garde les N decks les plus récents
   */
  private cleanupOldDecks(keepCount: number = 30): void {
    const decks = this.loadDecks();

    if (decks.length <= keepCount) {
      return;
    }

    // Trier par date de modification (plus récent en premier)
    decks.sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    // Garder seulement les N plus récents
    const kept = decks.slice(0, keepCount);
    this.saveDecks(kept);
  }

  /**
   * Exporte tous les decks en JSON (pour backup externe)
   *
   * @returns JSON string des decks
   */
  exportDecksToJSON(): string {
    const decks = this.loadDecks();
    return JSON.stringify(decks, null, 2);
  }

  /**
   * Importe des decks depuis JSON (pour restauration)
   *
   * @param json - JSON string contenant les decks
   * @param merge - Si true, fusionne avec les decks existants, sinon remplace
   */
  importDecksFromJSON(json: string, merge: boolean = true): void {
    try {
      const importedDecks: SavedDeck[] = JSON.parse(json);

      if (!Array.isArray(importedDecks)) {
        throw new Error('Format JSON invalide');
      }

      let decks = merge ? this.loadDecks() : [];

      // Ajouter les decks importés (éviter les doublons par ID)
      importedDecks.forEach(imported => {
        const existingIndex = decks.findIndex(d => d.id === imported.id);
        if (existingIndex >= 0) {
          decks[existingIndex] = imported;
        } else {
          decks.push(imported);
        }
      });

      this.saveDecks(decks);
    } catch (error) {
      throw new Error('Échec de l\'import des decks. Vérifiez le format JSON.');
    }
  }
}
