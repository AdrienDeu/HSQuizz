import { Component, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, first } from 'rxjs/operators';
import { CardDisplayComponent, DisplayableCard } from '../card-display/card-display.component';
import { CardService } from '../../services/card.service';
import { QuizService } from '../../services/quiz.service';
import { Card, QuizQuestion, HiddenAttribute, QuizSettings } from '../../models/card.model';

export interface DisplayableQuizQuestion extends Omit<QuizQuestion, 'card'> {
  displayableCard: DisplayableCard;
}

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule, AsyncPipe, CardDisplayComponent],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.scss'
})
export class QuizComponent implements OnInit {

  public question$: Observable<DisplayableQuizQuestion | null>;
  public score$: Observable<number>;
  public questionNumber$: Observable<number>;
  public quizIsOver$: Observable<boolean>;
  public availableSets$: Observable<{ code: string; name: string }[]>;
  
  public settings: QuizSettings = { selectedSets: [], hiddenAttribute: 'name' };
  public attributeOptions: { value: HiddenAttribute; label: string }[];

  constructor(
    private cardService: CardService,
    private quizService: QuizService
  ) {
    this.score$ = this.quizService.score$;
    this.questionNumber$ = this.quizService.questionNumber$;
    this.quizIsOver$ = this.quizService.quizIsOver$;
    this.availableSets$ = this.cardService.getCards().pipe(
      map(cards => this.cardService.getAvailableSets(cards))
    );

    this.question$ = this.quizService.question$.pipe(
      map(q => q ? this.mapToDisplayable(q) : null)
    );

    this.attributeOptions = [
      { value: 'name', label: 'name' },
      { value: 'cardClass', label: 'cardClass' },
      { value: 'cost', label: 'cost' },
      { value: 'attack', label: 'attack' },
      { value: 'health', label: 'health' },
      { value: 'rarity', label: 'rarity' },
      { value: 'set', label: 'set' }
    ];
  }

  ngOnInit(): void {
    this.availableSets$.pipe(first()).subscribe(sets => {
      if (sets && sets.length > 0) {
        this.settings.selectedSets = sets.map(s => s.code);
      }
    });
  }


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
    if (!question) return 'Guess...';
    const label = this.attributeOptions.find(o => o.value === question.hiddenAttribute)?.label;
    return 'Guess: ' + (label || '');
  }

  private mapToDisplayable(question: QuizQuestion): DisplayableQuizQuestion {
    const card = question.card;
    const displayableCard: DisplayableCard = {
      ...card,
      translatedType: card.type,
      translatedClass: card.cardClass,
      translatedRarity: card.rarity ?? '-',
      translatedRace: card.race ?? '',
      translatedSet: card.set,
      cleanText: CardService.cleanCardText(card.text),
      rarityClass: card.rarity?.toLowerCase() ?? 'common',
      isMinion: card.type === 'MINION',
      isWeapon: card.type === 'WEAPON',
    };
    return { ...question, displayableCard };
  }
}
