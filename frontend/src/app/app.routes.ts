import { Routes } from '@angular/router';
import { QuizComponent } from './components/quiz/quiz.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { DeckBuilderComponent } from './components/deck-builder/deck-builder.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

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
  },
  {
    path: '**',
    component: NotFoundComponent,
    title: '404 - Not Found'
  }
];
