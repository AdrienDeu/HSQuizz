import { Component, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, first } from 'rxjs/operators';
import { CardDisplayComponent, DisplayableCard } from '../card-display/card-display.component';
import { CardService } from '../../services/card.service';
import { QuizService } from '../../services/quiz.service';
import { Card, QuizQuestion, HiddenAttribute, QuizSettings, HIDDEN_ATTRIBUTE_LABELS, SET_TRANSLATIONS } from '../../models/card.model';

// Modèle de Données pour l'Affichage
export interface DisplayableQuizQuestion extends Omit<QuizQuestion, 'card'> {
  displayableCard: DisplayableCard;
}

// Commentaire Pédagogique : Le composant "Smart".
// - Gère la communication avec les services.
// - Expose les flux de données (Observables) au template.
// - Prépare/mappe les données pour les composants "Dumb" enfants.
// - Ne contient AUCUNE logique métier ou d'état du quiz (score, question actuelle...).
@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule, AsyncPipe, CardDisplayComponent],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.scss'
})
export class QuizComponent implements OnInit {

  // --- Observables Publics pour le Template ---
  public question$: Observable<DisplayableQuizQuestion | null>;
  public score$: Observable<number>;
  public questionNumber$: Observable<number>;
  public quizIsOver$: Observable<boolean>;
  public availableSets$: Observable<{ code: string; name: string }[]>;
  
  // --- État Local (Uniquement pour le formulaire de configuration) ---
  public settings: QuizSettings = { selectedSets: [], hiddenAttribute: 'name' };
  public attributeOptions: { value: HiddenAttribute; label: string }[];

  constructor(
    private cardService: CardService,
    private quizService: QuizService
  ) {
    // On connecte les observables des services aux propriétés publiques.
    this.score$ = this.quizService.score$;
    this.questionNumber$ = this.quizService.questionNumber$;
    this.quizIsOver$ = this.quizService.quizIsOver$;
    this.availableSets$ = this.cardService.getCards().pipe(
      map(cards => this.cardService.getAvailableSets(cards))
    );

    // Commentaire Pédagogique : C'est ici que la magie opère.
    // On s'abonne à la question brute du service, et on la transforme (map)
    // en une question "d'affichage" avant de l'exposer au template.
    this.question$ = this.quizService.question$.pipe(
      map(q => q ? this.mapToDisplayable(q) : null)
    );
    
    // Initialisation des options du formulaire (données statiques).
    this.attributeOptions = (Object.keys(HIDDEN_ATTRIBUTE_LABELS) as HiddenAttribute[]).map(key => ({
        value: key,
        label: HIDDEN_ATTRIBUTE_LABELS[key]
    }));
  }

  ngOnInit(): void {
    // Pré-sélectionner toutes les extensions par défaut pour une meilleure UX.
    this.availableSets$.pipe(first()).subscribe(sets => {
      if (sets && sets.length > 0) {
        this.settings.selectedSets = sets.map(s => s.code);
      }
    });
  }

  // --- Actions de l'Utilisateur (Délégation) ---

  public startQuiz(): void {
    this.cardService.getCards(true).pipe(first()).subscribe(allCards => {
      this.quizService.startQuiz(this.settings, allCards);
    });
  }

  public submitAnswer(answer: string): void {
    if (!answer?.trim()) return;
    this.quizService.submitAnswer(answer);
  }
  
  public skipQuestion(): void {
    this.quizService.skipQuestion();
  }
  
  public restartQuiz(): void {
    this.quizService.restartQuiz();
  }

  public backToSettings(): void {
    this.quizService.backToSettings();
  }

  // --- Fonctions d'Aide pour le Template (Formulaire) ---
  
  toggleSet(setCode: string): void {
    const index = this.settings.selectedSets.indexOf(setCode);
    if (index === -1) {
      this.settings.selectedSets.push(setCode);
    } else {
      this.settings.selectedSets.splice(index, 1);
    }
  }

  toggleAllSets(allSets: { code: string; name: string }[] | null): void {
    if (!allSets) return;
    if (this.settings.selectedSets.length === allSets.length) {
      this.settings.selectedSets = [];
    } else {
      this.settings.selectedSets = allSets.map(s => s.code);
    }
  }

  getCorrectAnswer(question: DisplayableQuizQuestion): string {
    return this.quizService.getAttributeValue(question.displayableCard, question.hiddenAttribute);
  }

  public getPlaceholder(question: DisplayableQuizQuestion | null): string {
    if (!question) return 'Devinez...';
    const label = this.attributeOptions.find(o => o.value === question.hiddenAttribute)?.label;
    return 'Devinez : ' + (label || '');
  }

  // --- Mapper Privé ---
  /**
   * Transforme un objet Card brut en un objet DisplayableCard prêt à l'emploi.
   */
  private mapToDisplayable(question: QuizQuestion): DisplayableQuizQuestion {
    const card = question.card;
    const displayableCard: DisplayableCard = {
      ...card,
      translatedType: CardService.translateType(card.type),
      translatedClass: CardService.translateClass(card.cardClass),
      translatedRarity: card.rarity ? CardService.translateRarity(card.rarity) : '-',
      translatedRace: card.race ? CardService.translateRace(card.race) : '',
      translatedSet: CardService.translateSet(card.set),
      cleanText: CardService.cleanCardText(card.text),
      rarityClass: card.rarity?.toLowerCase() ?? 'common',
      isMinion: card.type === 'MINION',
      isWeapon: card.type === 'WEAPON',
    };
    return { ...question, displayableCard };
  }
}
