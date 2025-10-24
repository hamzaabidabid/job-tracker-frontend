import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';

// IMPORTS ANGULAR MATERIAL NÉCESSAIRES
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import {filter} from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    // AJOUTER LES MODULES ICI
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'job-tracker-ui';
  isExpanded = true;
  currentPageTitle = 'Dashboard';// Le sidenav est ouvert par défaut

  // Pour rendre le code HTML plus propre, on définit les liens ici
  navItems = [
    { link: '/dashboard', icon: 'dashboard', label: 'Dashboard', title: 'Dashboard' },
    { link: '/jobs', icon: 'list_alt', label: 'Toutes les offres', title: 'Liste des candidatures' },
    { link: '/favorites', icon: 'star', label: 'Favoris', title: 'Mes Favoris' }
  ];
  toggleSidenav() {
    this.isExpanded = !this.isExpanded;
  }
  constructor(private router: Router) {
    // Met à jour le titre de la page à chaque changement de route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const currentRoute = this.navItems.find(item => event.urlAfterRedirects.includes(item.link));
      this.currentPageTitle = currentRoute ? currentRoute.title : 'Job Tracker';
    });
  }
}
