import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  readonly email = 'deu.adrien@gmail.com';
  readonly suggestionsSubject = 'Suggestion HSQuizz';
  
  get mailtoLink(): string {
    return `mailto:${this.email}?subject=${encodeURIComponent(this.suggestionsSubject)}`;
  }
}
