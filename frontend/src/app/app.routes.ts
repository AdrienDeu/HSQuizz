import { Routes } from '@angular/router';
import { QuizComponent } from './components/quiz/quiz.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { DeckBuilderComponent } from './components/deck-builder/deck-builder.component';

export const routes: Routes = [
  {
    path: '',
    component: QuizComponent,
    title: 'HSQuizz - Quiz Hearthstone'
  },
  {
    path: 'leaderboard',
    component: LeaderboardComponent,
    title: 'Leaderboard - HSQuizz'
  },
  {
    path: 'deck-builder',
    component: DeckBuilderComponent,
    title: 'Deck Builder - HSQuizz'
  }
];
