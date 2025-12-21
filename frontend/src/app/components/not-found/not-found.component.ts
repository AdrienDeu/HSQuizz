import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  template: `
    <div class="not-found-container">
      <h1>404 - Page non trouvée</h1>
      <button class="btn btn-primary" (click)="goHome()">Retour à l'accueil</button>
    </div>
  `,
  styles: [`
    .not-found-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      gap: 1.5rem;
    }
    h1 { color: #ff9900; }
    .btn { padding: 0.5rem 1.5rem; border-radius: 8px; background: #ffd700; color: #222; text-decoration: none; font-weight: bold; cursor: pointer; }
    .btn:hover { background: #ffec8b; }
  `]
})
export class NotFoundComponent {
  constructor(private router: Router) {}
  goHome() {
    this.router.navigate(['/']);
  }
}
