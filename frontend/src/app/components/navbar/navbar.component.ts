import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  readonly email = 'deu.adrien@gmail.com';
  readonly suggestionsSubject = 'Suggestion HSQuizz';
  
  isMenuOpen = false;

  get mailtoLink(): string {
    return `mailto:${this.email}?subject=${encodeURIComponent(this.suggestionsSubject)}`;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    if (window.innerWidth > 768) {
      this.isMenuOpen = false;
    }
  }
}
