import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Params, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Job } from '../../models/job';
import { JobService } from '../../services/job.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatCardModule, MatTableModule, MatIconModule,
    MatButtonModule, MatTooltipModule, MatPaginatorModule, MatFormFieldModule, MatInputModule
  ],
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.scss']
})
export class JobListComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns: string[] = ['nom', 'entreprise', 'dateCandidature', 'status', 'actions'];
  dataSource = new MatTableDataSource<Job>();
  private allJobs: Job[] = []; // Garde TOUJOURS la liste complète
  private favoriteIds = new Set<number>();

  // On stocke les abonnements pour pouvoir les détruire proprement
  private queryParamsSub!: Subscription;
  private favoritesSub!: Subscription;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private jobService: JobService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // On s'abonne aux changements des favoris.
    // Cela garantit que la liste est toujours visuellement à jour.
    this.favoritesSub = this.jobService.favoriteJobIds$.subscribe(ids => {
      this.favoriteIds = ids;
      // Si des données sont déjà affichées, on les met à jour
      if (this.dataSource.data.length > 0) {
        this.updateFavoritesStatus(this.dataSource.data);
      }
    });

    this.loadAndFilterJobs();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.filterPredicate = (job: Job, filter: string) => {
      return job.entreprise.nom.toLowerCase().includes(filter);
    };
  }

  // Méthode pour se désabonner et éviter les fuites de mémoire
  ngOnDestroy(): void {
    if (this.queryParamsSub) {
      this.queryParamsSub.unsubscribe();
    }
    if (this.favoritesSub) {
      this.favoritesSub.unsubscribe();
    }
  }

  loadAndFilterJobs(): void {
    this.jobService.getAllJobs().subscribe(data => {
      this.allJobs = data;
      // On met à jour le statut favori de la liste complète
      this.updateFavoritesStatus(this.allJobs);

      // On écoute les changements dans l'URL pour appliquer les filtres
      this.queryParamsSub = this.route.queryParams.subscribe((params: Params) => {
        this.applyFiltersFromParams(params);
      });
    });
  }

  private applyFiltersFromParams(params: Params): void {
    let filteredJobs = [...this.allJobs];
    const status = params['status'];
    const filter = params['filter'];

    if (status) {
      filteredJobs = filteredJobs.filter(job => job.status === status);
    } else if (filter === 'pending') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filteredJobs = filteredJobs.filter(job =>
        job.status === 'EN_COURS' && new Date(job.dateCandidature) < sevenDaysAgo
      );
    }

    this.dataSource.data = filteredJobs;
  }

  // Méthode utilitaire pour mettre à jour la propriété 'isFavorite'
  private updateFavoritesStatus(jobs: Job[]): void {
    jobs.forEach(job => {
      job.isFavorite = this.favoriteIds.has(job.id);
    });
    // Forcer la détection de changement si les données sont déjà dans la dataSource
    this.dataSource.data = [...this.dataSource.data];
  }

  // Fonction pour la barre de recherche
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Appelle simplement le service. Le service notifiera tous les composants du changement.
  toggleFavorite(job: Job): void {
    this.jobService.toggleFavorite(job.id).subscribe();
  }

  deleteJob(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      this.jobService.deleteJob(id).subscribe(() => {
        this.loadAndFilterJobs(); // Recharger les données après suppression
      });
    }
  }
}
