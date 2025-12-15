import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardDisplayComponent } from '../card-display/card-display.component';
import { CardService } from '../../services/card.service';
import { QuizService } from '../../services/quiz.service';
import { Card, QuizQuestion } from '../../models/card.model';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule, CardDisplayComponent],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.scss'
})
export class QuizComponent implements OnInit {
  cards: Card[] = [];
  currentQuestion: QuizQuestion | null = null;
  userAnswer: string = '';
  loading: boolean = true;
  error: string | null = null;
  
  // Stats
  totalAnswered: number = 0;
  correctAnswers: number = 0;

  constructor(
    private cardService: CardService,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    this.loadCards();
  }

  /**
   * Charge les cartes depuis le service
   */
  loadCards(): void {
    this.loading = true;
    this.error = null;
    
    this.cardService.getCollectibleCards().subscribe({
      next: (cards) => {
        this.cards = cards;
        this.loading = false;
        this.nextCard();
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des cartes. Veuillez rafraîchir la page.';
        this.loading = false;
        console.error('Error loading cards:', err);
      }
    });
  }

  /**
   * Passe à la carte suivante
   */
  nextCard(): void {
    if (this.cards.length === 0) return;
    
    const card = this.quizService.selectRandomCard(this.cards);
    this.currentQuestion = this.quizService.createQuestion(card, 'name');
    this.userAnswer = '';
  }

  /**
   * Soumet la réponse de l'utilisateur
   */
  submitAnswer(): void {
    if (!this.currentQuestion || !this.userAnswer.trim()) return;
    
    const isCorrect = this.quizService.checkAnswer(this.currentQuestion, this.userAnswer);
    this.currentQuestion.answered = true;
    this.currentQuestion.correct = isCorrect;
    this.currentQuestion.userAnswer = this.userAnswer;
    
    this.totalAnswered++;
    if (isCorrect) {
      this.correctAnswers++;
    }
  }

  /**
   * Révèle la réponse sans soumettre
   */
  revealAnswer(): void {
    if (!this.currentQuestion) return;
    
    this.currentQuestion.revealed = true;
    this.currentQuestion.answered = true;
    this.currentQuestion.correct = false;
    this.totalAnswered++;
  }

  /**
   * Réessayer (pour une réponse incorrecte)
   */
  retry(): void {
    if (!this.currentQuestion) return;
    
    this.currentQuestion.answered = false;
    this.currentQuestion.correct = null;
    this.userAnswer = '';
    this.totalAnswered--; // Annule le compteur
  }

  /**
   * Calcule le pourcentage de réussite
   */
  get successRate(): number {
    if (this.totalAnswered === 0) return 0;
    return Math.round((this.correctAnswers / this.totalAnswered) * 100);
  }

  /**
   * Gère la touche Entrée pour soumettre
   */
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !this.currentQuestion?.answered) {
      this.submitAnswer();
    }
  }
}
