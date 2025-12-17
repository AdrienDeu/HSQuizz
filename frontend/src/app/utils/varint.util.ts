/**
 * Utilitaire pour l'encodage et le décodage Varint
 *
 * Varint (Variable-length Integer) est un encodage qui permet de compresser les entiers.
 * Utilisé dans le format des deck codes Hearthstone.
 *
 * Format:
 * - 7 bits pour les données
 * - 1 bit pour indiquer la continuation (1 = plus de bytes à suivre, 0 = dernier byte)
 */
export class VarintUtil {
  /**
   * Encode un nombre en tableau de bytes varint
   *
   * @param value - Nombre à encoder (doit être >= 0)
   * @returns Tableau de bytes représentant le varint
   *
   * @example
   * VarintUtil.encode(0) => [0]
   * VarintUtil.encode(127) => [127]
   * VarintUtil.encode(128) => [128, 1]
   * VarintUtil.encode(300) => [172, 2]
   */
  static encode(value: number): number[] {
    if (value < 0) {
      throw new Error('Varint encoding requires non-negative integers');
    }

    const bytes: number[] = [];

    do {
      let byte = value & 0x7F; // Récupère les 7 bits inférieurs
      value >>>= 7;            // Décale de 7 bits vers la droite (unsigned)

      if (value > 0) {
        byte |= 0x80;          // Active le bit de continuation si plus de données
      }

      bytes.push(byte);
    } while (value > 0);

    return bytes;
  }

  /**
   * Décode un varint depuis un tableau de bytes.
   * Si le varint est incomplet, une erreur est levée.
   *
   * @param bytes - Tableau de bytes source
   * @param offset - Position de départ dans le tableau (défaut: 0)
   * @returns Objet contenant la valeur décodée et le nombre de bytes lus
   *
   * @example
   * VarintUtil.decode([0]) => { value: 0, bytesRead: 1 }
   * VarintUtil.decode([127]) => { value: 127, bytesRead: 1 }
   * VarintUtil.decode([128, 1]) => { value: 128, bytesRead: 2 }
   * VarintUtil.decode([172, 2]) => { value: 300, bytesRead: 2 }
   * VarintUtil.decode([128]) // throw 'Varint decode error: incomplete varint'
   */
  static decode(bytes: number[], offset: number = 0): { value: number; bytesRead: number } {
    let value = 0;
    let shift = 0;
    let bytesRead = 0;
    let hasMore = true;

    while (hasMore && offset + bytesRead < bytes.length) {
      const byte = bytes[offset + bytesRead];
      bytesRead++;

      value |= (byte & 0x7f) << shift;
      shift += 7;

      if ((byte & 0x80) === 0) {
        hasMore = false;
      }

      if (bytesRead > 10) {
        throw new Error('Varint decode error: too many bytes');
      }
    }

    if (hasMore && bytesRead > 0) {
      throw new Error('Varint decode error: incomplete varint');
    }

    if (bytesRead === 0 && offset >= bytes.length) {
      // Pas de données à lire à l'offset spécifié, mais ce n'est pas une erreur en soi.
      // Retourner 0 pour la valeur et les bytes lus est un comportement attendu.
    } else if (offset + bytesRead > bytes.length && bytesRead === 0) {
      // Cette condition est maintenant gérée par la logique ci-dessus.
      // On la garde pour la rétrocompatibilité si d'autres cas existent.
      throw new Error('Varint decode error: no data to read');
    }


    return { value, bytesRead };
  }

  /**
   * Calcule la taille en bytes d'un varint pour une valeur donnée
   *
   * @param value - Valeur à analyser
   * @returns Nombre de bytes nécessaires
   *
   * @example
   * VarintUtil.encodedSize(0) => 1
   * VarintUtil.encodedSize(127) => 1
   * VarintUtil.encodedSize(128) => 2
   */
  static encodedSize(value: number): number {
    if (value < 0) {
      throw new Error('Varint encoding requires non-negative integers');
    }

    let size = 0;
    do {
      value >>>= 7;
      size++;
    } while (value > 0);

    return size;
  }

  /**
   * Valide qu'un tableau de bytes représente un varint valide.
   * Un varint est valide s'il est complet et correctement formaté.
   *
   * @param bytes - Tableau de bytes à valider
   * @param offset - Position de départ
   * @returns true si valide, false sinon
   */
  static isValid(bytes: number[], offset: number = 0): boolean {
    if (!bytes || bytes.length === 0 || offset >= bytes.length) {
      return false;
    }
    
    try {
      const result = this.decode(bytes, offset);
      // Un varint valide doit avoir lu au moins un byte.
      // Si un varint est incomplet, decode lève une exception, qui est attrapée.
      return result.bytesRead > 0;
    } catch {
      return false;
    }
  }
}
