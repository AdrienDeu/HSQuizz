import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  readonly authorName = 'Adrien Deü';
  readonly linkedinUrl = 'https://linkedin.com/in/adrien-deü';
  readonly githubUrl = 'https://github.com/AdrienDeu';
  readonly currentYear = new Date().getFullYear();
}
