import { Component } from '@angular/core';
import { QuizComponent } from './components/quiz/quiz.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [QuizComponent],
  template: '<app-quiz></app-quiz>',
  styles: []
})
export class App {}
