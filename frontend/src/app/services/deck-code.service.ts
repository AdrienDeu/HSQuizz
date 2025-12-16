import { Injectable } from '@angular/core';
import { Deck, SavedDeck, HERO_DBF_IDS, DBF_ID_TO_CLASS } from '../models/deck.model';
import { Card } from '../models/card.model';
import { VarintUtil } from '../utils/varint.util';

/**
 * Service pour encoder/décoder les deck codes Hearthstone
 *
 * Format du deck code (version 1) - Format officiel Hearthstone:
 * 1. Reserved byte (0x00)
 * 2. Version byte (1)
 * 3. Format (varint: 1=wild, 2=standard)
 * 4. Nombre de héros (varint)
 * 5. Hero DBF IDs (varint chacun)
 * 6. Cartes single copy: count + DBF IDs triés
 * 7. Cartes double copy: count + DBF IDs triés
 * 8. Cartes N-copy: count + pairs (DBF ID, count)
 * 9. Base64 encode
 */
@Injectable({
  providedIn: 'root'
})
export class DeckCodeService {
  private readonly FORMAT_STANDARD = 2;
  private readonly FORMAT_WILD = 1;
  private readonly VERSION = 1;

  constructor() {}

  /**
   * Encode un deck en code Hearthstone (format AAECAa0G...)
   *
   * @param deck - Deck à encoder
   * @returns Code du deck en base64
   */
  encodeDeck(deck: Deck): string {
    const bytes: number[] = [];

    // 1. Reserved byte (0x00)
    bytes.push(0);

    // 2. Version byte (1)
    bytes.push(this.VERSION);

    // 3. Format
    const format = deck.format === 'standard' ? this.FORMAT_STANDARD : this.FORMAT_WILD;
    bytes.push(...VarintUtil.encode(format));

    // 4. Nombre de héros (toujours 1 pour le constructed)
    bytes.push(...VarintUtil.encode(1));

    // 5. Hero DBF ID
    const heroDbfId = this.getHeroDbfId(deck.heroClass);
    bytes.push(...VarintUtil.encode(heroDbfId));

    // 6. Organiser les cartes par quantité
    const singleCopy: number[] = [];
    const doubleCopy: number[] = [];
    const nCopy: Array<{ dbfId: number; count: number }> = [];

    deck.cards.forEach(deckCard => {
      const dbfId = deckCard.card.dbfId;
      if (deckCard.quantity === 1) {
        singleCopy.push(dbfId);
      } else if (deckCard.quantity === 2) {
        doubleCopy.push(dbfId);
      } else if (deckCard.quantity > 2) {
        nCopy.push({ dbfId, count: deckCard.quantity });
      }
    });

    // Trier par DBF ID (requis par le format)
    singleCopy.sort((a, b) => a - b);
    doubleCopy.sort((a, b) => a - b);
    nCopy.sort((a, b) => a.dbfId - b.dbfId);

    // 7. Cartes single copy
    bytes.push(...VarintUtil.encode(singleCopy.length));
    singleCopy.forEach(dbfId => {
      bytes.push(...VarintUtil.encode(dbfId));
    });

    // 8. Cartes double copy
    bytes.push(...VarintUtil.encode(doubleCopy.length));
    doubleCopy.forEach(dbfId => {
      bytes.push(...VarintUtil.encode(dbfId));
    });

    // 9. Cartes N-copy (pour modes spéciaux)
    bytes.push(...VarintUtil.encode(nCopy.length));
    nCopy.forEach(({ dbfId, count }) => {
      bytes.push(...VarintUtil.encode(dbfId));
      bytes.push(...VarintUtil.encode(count));
    });

    // 10. Encoder en base64
    return this.base64Encode(new Uint8Array(bytes));
  }

  /**
   * Décode un code Hearthstone en objet Deck partiel
   *
   * Note: Cette méthode retourne les DBF IDs des cartes.
   * Il faut ensuite récupérer les cartes complètes via CardService.
   *
   * @param deckCode - Code du deck (AAECAa0G...)
   * @returns Objet avec heroClass, format, et listes de DBF IDs
   */
  decodeDeck(deckCode: string): {
    heroClass: string;
    format: 'standard' | 'wild';
    singleCopyDbfIds: number[];
    doubleCopyDbfIds: number[];
    nCopyCards: Array<{ dbfId: number; count: number }>;
  } | null {
    try {
      // 1. Décoder de base64
      const bytes = Array.from(this.base64Decode(deckCode));
      let offset = 0;
      console.log(`🔍 Décodage: ${bytes.length} bytes total`);

      // 2. Lire header (format officiel Hearthstone)
      if (bytes.length < 2) {
        throw new Error('Deck code trop court');
      }

      // Byte 1: Reserved (0x00)
      const reservedByte = bytes[offset++];
      console.log(`   Reserved byte: ${reservedByte}`);

      // Byte 2: Version (1)
      const version = bytes[offset++];
      console.log(`   Version: ${version}`);

      if (version !== this.VERSION && version !== 0) {
        console.warn(`Version non supportée: ${version}`);
      }

      // 3. Lire format
      const formatResult = VarintUtil.decode(bytes, offset);
      offset += formatResult.bytesRead;
      const format = formatResult.value === this.FORMAT_STANDARD ? 'standard' : 'wild';
      console.log(`   Format: ${formatResult.value} (${format}), offset: ${offset}`);

      // 4. Lire nombre de héros
      const numHeroesResult = VarintUtil.decode(bytes, offset);
      offset += numHeroesResult.bytesRead;
      console.log(`   Nombre de héros: ${numHeroesResult.value}, offset: ${offset}`);

      // 5. Lire TOUS les hero DBF IDs (important!)
      // Pour les decks avec Maestra (multi-héros), on préfère le héros non-NEUTRAL
      let heroClass = 'NEUTRAL'; // Défaut
      for (let i = 0; i < numHeroesResult.value; i++) {
        const heroDbfIdResult = VarintUtil.decode(bytes, offset);
        offset += heroDbfIdResult.bytesRead;
        const currentHeroClass = this.getClassFromHeroDbfId(heroDbfIdResult.value);

        // Préférer un héros avec une vraie classe plutôt que NEUTRAL
        if (currentHeroClass !== 'NEUTRAL') {
          heroClass = currentHeroClass;
        } else if (i === 0) {
          // Si c'est le premier héros, on l'utilise par défaut
          heroClass = currentHeroClass;
        }
        console.log(`   Hero ${i + 1} DBF ID: ${heroDbfIdResult.value} (${currentHeroClass}), offset: ${offset}`);
      }

      // 6. Lire cartes single copy
      const singleCountResult = VarintUtil.decode(bytes, offset);
      offset += singleCountResult.bytesRead;
      console.log(`   Single copy count: ${singleCountResult.value}, offset: ${offset}`);
      const singleCopyDbfIds: number[] = [];

      for (let i = 0; i < singleCountResult.value; i++) {
        const dbfIdResult = VarintUtil.decode(bytes, offset);
        offset += dbfIdResult.bytesRead;
        singleCopyDbfIds.push(dbfIdResult.value);
      }
      console.log(`   Single copy cards: ${singleCopyDbfIds.length} cartes lues, offset: ${offset}`);

      // 7. Lire cartes double copy
      const doubleCountResult = VarintUtil.decode(bytes, offset);
      offset += doubleCountResult.bytesRead;
      const doubleCopyDbfIds: number[] = [];

      for (let i = 0; i < doubleCountResult.value; i++) {
        const dbfIdResult = VarintUtil.decode(bytes, offset);
        offset += dbfIdResult.bytesRead;
        doubleCopyDbfIds.push(dbfIdResult.value);
      }

      // 8. Lire cartes N-copy
      const nCopyCountResult = VarintUtil.decode(bytes, offset);
      offset += nCopyCountResult.bytesRead;
      const nCopyCards: Array<{ dbfId: number; count: number }> = [];

      for (let i = 0; i < nCopyCountResult.value; i++) {
        const dbfIdResult = VarintUtil.decode(bytes, offset);
        offset += dbfIdResult.bytesRead;
        const countResult = VarintUtil.decode(bytes, offset);
        offset += countResult.bytesRead;
        nCopyCards.push({ dbfId: dbfIdResult.value, count: countResult.value });
      }

      return {
        heroClass,
        format,
        singleCopyDbfIds,
        doubleCopyDbfIds,
        nCopyCards
      };

    } catch (error) {
      console.error('Erreur lors du décodage du deck code:', error);
      return null;
    }
  }

  /**
   * Valide un code de deck
   *
   * @param deckCode - Code à valider
   * @returns true si le code est valide
   */
  validateDeckCode(deckCode: string): boolean {
    if (!deckCode || deckCode.trim().length === 0) {
      return false;
    }

    try {
      const decoded = this.decodeDeck(deckCode);
      return decoded !== null;
    } catch {
      return false;
    }
  }

  /**
   * Récupère le DBF ID d'un héros à partir de sa classe
   */
  private getHeroDbfId(heroClass: string): number {
    const dbfId = HERO_DBF_IDS[heroClass];
    if (!dbfId) {
      console.warn(`Classe inconnue: ${heroClass}, utilisation de MAGE par défaut`);
      return HERO_DBF_IDS['MAGE'];
    }
    return dbfId;
  }

  /**
   * Récupère la classe à partir du DBF ID du héros
   */
  private getClassFromHeroDbfId(dbfId: number): string {
    const heroClass = DBF_ID_TO_CLASS[dbfId];
    if (!heroClass) {
      console.warn(`DBF ID inconnu: ${dbfId}, utilisation de MAGE par défaut`);
      return 'MAGE';
    }
    return heroClass;
  }

  /**
   * Encode un tableau de bytes en base64
   */
  private base64Encode(bytes: Uint8Array): string {
    let binary = '';
    bytes.forEach(byte => binary += String.fromCharCode(byte));
    return btoa(binary);
  }

  /**
   * Décode une chaîne base64 en tableau de bytes
   */
  private base64Decode(str: string): Uint8Array {
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}
