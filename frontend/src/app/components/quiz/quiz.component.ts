import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardDisplayComponent } from '../card-display/card-display.component';
import { CardService } from '../../services/card.service';
import { QuizService } from '../../services/quiz.service';
import { Card, QuizQuestion, HiddenAttribute, QuizSettings, HIDDEN_ATTRIBUTE_LABELS, SET_TRANSLATIONS } from '../../models/card.model';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule, CardDisplayComponent],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.scss'
})
export class QuizComponent implements OnInit {
  // Données des cartes
  allCards: Card[] = [];
  filteredCards: Card[] = [];
  currentQuestion: QuizQuestion | null = null;
  userAnswer: string = '';
  loading: boolean = true;
  reloadingCards: boolean = false;
  error: string | null = null;
  
  // Configuration du quiz
  quizStarted: boolean = false;
  availableSets: { code: string; name: string }[] = [];
  settings: QuizSettings = {
    selectedSets: [],
    hiddenAttribute: 'name',
    numberOfQuestions: 10 // Default to 10 questions
  };
  includeNonCollectible: boolean = false;
  
  // Options pour les attributs
  attributeOptions: { value: HiddenAttribute; label: string }[] = [
    { value: 'name', label: HIDDEN_ATTRIBUTE_LABELS['name'] },
    { value: 'cardClass', label: HIDDEN_ATTRIBUTE_LABELS['cardClass'] },
    { value: 'cost', label: HIDDEN_ATTRIBUTE_LABELS['cost'] },
    { value: 'attack', label: HIDDEN_ATTRIBUTE_LABELS['attack'] },
    { value: 'health', label: HIDDEN_ATTRIBUTE_LABELS['health'] },
    { value: 'rarity', label: HIDDEN_ATTRIBUTE_LABELS['rarity'] },
    { value: 'set', label: HIDDEN_ATTRIBUTE_LABELS['set'] }
  ];
  
  // Stats
  totalAnswered: number = 0;
  correctAnswers: number = 0;
  currentQuestionNumber: number = 0; // Tracks the current question number
  quizFinished: boolean = false; // Indicates if the quiz has finished

  constructor(
    private cardService: CardService,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    this.loading = true; // Set global loading for initial load
    this.loadCards(true);
  }

  /**
   * Charge les cartes depuis le service
   */
  loadCards(isInitialLoad: boolean = false): void {
    if (!isInitialLoad) {
      this.reloadingCards = true; // Use localized loading for subsequent reloads
    }
    this.error = null;

    this.cardService.getCollectibleCards(this.includeNonCollectible).subscribe({
      next: (cards) => {
        this.allCards = cards;
        if (isInitialLoad) { // Only set global loading to false if it was an initial load
          this.loading = false;
        }
        this.reloadingCards = false;
        if (isInitialLoad) {
          this.loadAvailableSets();
        }
      },
      error: (err) => {
        this.error = 'Error loading cards. Please refresh the page.';
        if (isInitialLoad) { // Only set global loading to false if it was an initial load
          this.loading = false;
        }
        this.reloadingCards = false;
      }
    });
  }

  /**
   * Charge la liste des extensions disponibles
   */
  loadAvailableSets(): void {
    this.cardService.getAvailableSets().subscribe({
      next: (sets) => {
        this.availableSets = sets;
      }
    });
  }

  /**
   * Démarre le quiz avec les paramètres actuels
   */
  startQuiz(): void {
    this.applyFilters();
    
    if (this.filteredCards.length === 0) {
      this.error = 'No cards match the selected filters.';
      return;
    }

    if (this.settings.numberOfQuestions <= 0) {
      this.error = 'Number of questions must be positive.';
      return;
    }
    
    this.quizStarted = true;
    this.resetStats();
    this.quizService.resetPreviousCard();
    this.nextCard();
  }

  /**
   * Applique les filtres de configuration
   */
  applyFilters(): void {
    let cards = this.allCards;
    
    // Filtre par extension
    cards = this.cardService.filterCardsBySets(cards, this.settings.selectedSets);
    
    // Filtre par attribut (pour s'assurer que l'attribut existe)
    cards = this.cardService.filterCardsByAttribute(cards, this.settings.hiddenAttribute);
    
    this.filteredCards = cards;
  }

  /**
   * Retourne à la configuration
   */
  backToSettings(): void {
    this.quizStarted = false;
    this.currentQuestion = null;
    this.error = null;
    this.quizFinished = false; // Reset quiz finished state
  }

  /**
   * Toggle la sélection d'une extension
   */
  toggleSet(setCode: string): void {
    const index = this.settings.selectedSets.indexOf(setCode);
    if (index === -1) {
      this.settings.selectedSets.push(setCode);
    } else {
      this.settings.selectedSets.splice(index, 1);
    }
  }

  /**
   * Vérifie si une extension est sélectionnée
   */
  isSetSelected(setCode: string): boolean {
    return this.settings.selectedSets.includes(setCode);
  }

  /**
   * Sélectionne ou désélectionne toutes les extensions
   */
  toggleAllSets(): void {
    if (this.settings.selectedSets.length === this.availableSets.length) {
      this.settings.selectedSets = [];
    } else {
      this.settings.selectedSets = this.availableSets.map(s => s.code);
    }
  }

  /**
   * Passe à la carte suivante
   */
  nextCard(): void {
    if (this.currentQuestionNumber >= this.settings.numberOfQuestions) {
      this.quizFinished = true;
      return;
    }

    if (this.filteredCards.length === 0) return;
    
    this.currentQuestionNumber++;
    const card = this.quizService.selectRandomCard(this.filteredCards);
    this.currentQuestion = this.quizService.createQuestion(card, this.settings.hiddenAttribute);
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

    if (this.totalAnswered >= this.settings.numberOfQuestions) {
      this.quizFinished = true;
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

    if (this.totalAnswered >= this.settings.numberOfQuestions) {
      this.quizFinished = true;
    }
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
   * Réinitialise les statistiques
   */
  resetStats(): void {
    this.totalAnswered = 0;
    this.correctAnswers = 0;
    this.currentQuestionNumber = 0; // Reset current question number
    this.quizFinished = false; // Reset quiz finished state
  }

  /**
   * Calcule le pourcentage de réussite
   */
  get successRate(): number {
    if (this.totalAnswered === 0) return 0;
    return Math.round((this.correctAnswers / this.totalAnswered) * 100);
  }

  /**
   * Retourne le nombre de cartes après filtrage (preview)
   */
  get previewCardCount(): number {
    let cards = this.allCards;
    cards = this.cardService.filterCardsBySets(cards, this.settings.selectedSets);
    cards = this.cardService.filterCardsByAttribute(cards, this.settings.hiddenAttribute);
    return cards.length;
  }

  /**
   * Retourne le label de l'attribut actuel
   */
  get currentAttributeLabel(): string {
    return this.quizService.getAttributeLabel(this.settings.hiddenAttribute);
  }

  /**
   * Retourne le placeholder pour le champ de réponse
   */
  get answerPlaceholder(): string {
    return this.quizService.getAnswerPlaceholder(this.settings.hiddenAttribute);
  }

  /**
   * Retourne les noms des extensions sélectionnées
   */
  get selectedSetsDisplay(): string {
    if (this.settings.selectedSets.length === 0) {
      return 'All sets';
    }
    if (this.settings.selectedSets.length <= 2) {
      return this.settings.selectedSets
        .map(code => SET_TRANSLATIONS[code] || code)
        .join(', ');
    }
    return `${this.settings.selectedSets.length} sets`;
  }

  /**
   * Retourne la réponse correcte pour la question actuelle
   */
  get correctAnswer(): string {
    if (!this.currentQuestion) return '';
    return this.quizService.getAttributeValue(
      this.currentQuestion.card,
      this.currentQuestion.hiddenAttribute
    );
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
