import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card, HiddenAttribute } from '../../models/card.model';

// Commentaire Pédagogique : Règle d'Or n°2 - Création d'une interface pour les données d'affichage.
// Ce modèle "Displayable" est une version enrichie de la Card de base.
// Le "Smart Component" parent sera responsable de créer cet objet.
// Le "Dumb Component" n'a plus qu'à l'afficher.
export interface DisplayableCard extends Card {
  translatedType: string;
  translatedClass: string;
  translatedRarity: string;
  translatedRace: string;
  translatedSet: string;
  cleanText: string;
  rarityClass: string;
  isMinion: boolean;
  isWeapon: boolean;
}

// Commentaire Pédagogique : Ce composant est maintenant un "Dumb Component" pur.
// - Il n'a AUCUNE dépendance à un service.
// - Il reçoit toutes ses données via des @Input.
// - Sa logique est minimale et ne concerne que l'affichage (ex: masquer une valeur).
@Component({
  selector: 'app-card-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-display.component.html',
  styleUrl: './card-display.component.scss'
})
export class CardDisplayComponent {
  @Input() card!: DisplayableCard;
  @Input() hiddenAttribute: HiddenAttribute = 'name';
  @Input() revealed: boolean = false;

  /**
   * Retourne la valeur à afficher, ou '???' si l'attribut est masqué.
   * C'est la seule logique qui reste, car elle dépend de l'état interne
   * du composant (`revealed` et `hiddenAttribute`).
   */
  getDisplayValue(attribute: HiddenAttribute, value: string | number | undefined): string {
    if (attribute === this.hiddenAttribute && !this.revealed) {
      return '???';
    }
    return value?.toString() ?? '-';
  }

  /**
   * Vérifie si un attribut doit être visuellement masqué.
   */
  isHidden(attribute: HiddenAttribute): boolean {
    return attribute === this.hiddenAttribute && !this.revealed;
  }
}