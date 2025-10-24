import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Job } from '../../models/job';
import { JobService } from '../../services/job.service';

@Component({
  selector: 'app-favorite-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatTableModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './favorite-list.component.html',
  styleUrls: ['./favorite-list.component.scss']
})
export class FavoriteListComponent implements OnInit {
  displayedColumns: string[] = ['nom', 'entreprise', 'dateCandidature', 'status', 'actions'];
  dataSource = new MatTableDataSource<Job>();

  constructor(private jobService: JobService) {}

  ngOnInit(): void {
    this.loadFavoriteJobs();
  }

  loadFavoriteJobs(): void {
    this.jobService.getFavoriteJobs().subscribe(data => {
      this.dataSource.data = data;
    });
  }

  // Cette méthode appelle le service. Le service mettra à jour l'état,
  // et la liste se mettra à jour d'elle-même.
  toggleFavorite(job: Job): void {
    this.jobService.toggleFavorite(job.id).subscribe(() => {
      // On peut simplement recharger la liste des favoris pour la simplicité
      this.loadFavoriteJobs();
    });
  }

  deleteJob(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      this.jobService.deleteJob(id).subscribe(() => {
        this.loadFavoriteJobs(); // Recharger après suppression
      });
    }
  }
}
