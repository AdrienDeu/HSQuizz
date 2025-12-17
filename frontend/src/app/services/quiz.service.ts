import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { Card, HiddenAttribute, QuizQuestion, QuizSettings } from '../models/card.model';
import { CardService } from './card.service';

@Injectable({
  providedIn: 'root'
})
export class QuizService {

  // --- État Privé ---
  private readonly _question$ = new BehaviorSubject<QuizQuestion | null>(null);
  private readonly _score$ = new BehaviorSubject<number>(0);
  private readonly _questionNumber$ = new BehaviorSubject<number>(0);
  private readonly _quizIsOver$ = new BehaviorSubject<boolean>(false);
  private _quizDeck: Card[] = [];
  
  private settings: QuizSettings = { selectedSets: [], hiddenAttribute: 'name' };
  private readonly TOTAL_QUESTIONS = 10;

  // --- Observables Publics ---
  public readonly question$: Observable<QuizQuestion | null> = this._question$.asObservable();
  public readonly score$: Observable<number> = this._score$.asObservable();
  public readonly questionNumber$: Observable<number> = this._questionNumber$.asObservable();
  public readonly quizIsOver$: Observable<boolean> = this._quizIsOver$.asObservable();

  constructor(private cardService: CardService) {}

  public startQuiz(settings: QuizSettings, allCards: Card[]): void {
    this.settings = settings;

    // 1. Filtrer la liste de cartes complète avec les paramètres du quiz
    let filteredCards = this.cardService.filterCardsBySets(allCards, settings.selectedSets);
    filteredCards = this.cardService.filterCardsByAttribute(filteredCards, settings.hiddenAttribute);

    // 2. Préparer le deck pour le quiz
    this._quizDeck = this.shuffleArray([...filteredCards]).slice(0, this.TOTAL_QUESTIONS);

    // 3. Réinitialiser l'état du quiz
    this._score$.next(0);
    this._questionNumber$.next(0);
    this._quizIsOver$.next(false);
    
    // 4. Lancer la première question
    this.nextQuestion();
  }

  public submitAnswer(userAnswer: string): void {
    const currentQuestion = this._question$.getValue();
    if (!currentQuestion || currentQuestion.answered) return;

    const isCorrect = this.checkAnswer(currentQuestion, userAnswer);
    
    if (isCorrect) {
      this._score$.next(this._score$.getValue() + 1);
    }

    const revealedQuestion: QuizQuestion = {
      ...currentQuestion,
      userAnswer,
      answered: true,
      correct: isCorrect,
      revealed: true
    };
    this._question$.next(revealedQuestion);

    setTimeout(() => this.nextQuestion(), 2000); 
  }

  private nextQuestion(): void {
    const questionNum = this._questionNumber$.getValue();

    if (questionNum >= this._quizDeck.length) {
      this.endQuiz();
      return;
    }

    const card = this._quizDeck[questionNum];
    const newQuestion = this.createQuestion(card, this.settings.hiddenAttribute);
    this._question$.next(newQuestion);
    this._questionNumber$.next(questionNum + 1);
  }
  
  private endQuiz(): void {
    this._quizIsOver$.next(true);
    this._question$.next(null);
  }

  public backToSettings(): void {
    this._quizIsOver$.next(false);
    this._question$.next(null);
  }

  private createQuestion(card: Card, hiddenAttribute: HiddenAttribute): QuizQuestion {
    return { card, hiddenAttribute, answered: false, correct: null, userAnswer: '', revealed: false };
  }
  
  private checkAnswer(question: QuizQuestion, userAnswer: string): boolean {
    const correctValue = this.getAttributeValue(question.card, question.hiddenAttribute);
    const normalizedUserAnswer = this.normalizeString(userAnswer);
    const normalizedCorrectValue = this.normalizeString(correctValue);
    
    if (question.hiddenAttribute === 'cardClass') {
      const translatedClass = CardService.translateClass(question.card.cardClass);
      if (normalizedUserAnswer === this.normalizeString(translatedClass)) return true;
    }
    if (question.hiddenAttribute === 'rarity' && question.card.rarity) {
      const translatedRarity = CardService.translateRarity(question.card.rarity);
      if (normalizedUserAnswer === this.normalizeString(translatedRarity)) return true;
    }
    if (question.hiddenAttribute === 'set') {
      const setCode = question.card.set;
      if (normalizedUserAnswer === this.normalizeString(setCode)) return true;
    }
    return normalizedUserAnswer === normalizedCorrectValue;
  }

  public getAttributeValue(card: Card, attribute: HiddenAttribute): string {
    switch (attribute) {
      case 'name': return card.name;
      case 'cardClass': return CardService.translateClass(card.cardClass);
      case 'cost': return card.cost?.toString() ?? '0';
      case 'attack': return card.attack?.toString() ?? '0';
      case 'health': return card.health?.toString() ?? '0';
      case 'rarity': return CardService.translateRarity(card.rarity ?? '');
      case 'set': return CardService.translateSet(card.set);
      default: return '';
    }
  }

  private normalizeString(str: string): string {
    if (!str) return '';
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/['']/g, ' ').replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
  }

  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}