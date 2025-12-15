import { Routes } from '@angular/router';
import { QuizComponent } from './components/quiz/quiz.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';

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
  }
];
