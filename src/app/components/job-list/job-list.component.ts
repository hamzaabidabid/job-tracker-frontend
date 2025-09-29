import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator'; // NOUVEL IMPORT
import { MatFormFieldModule } from '@angular/material/form-field'; // NOUVEL IMPORT
import { MatInputModule } from '@angular/material/input'; // NOUVEL IMPORT
import { Job } from '../../models/job';
import { JobService } from '../../services/job.service';

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
export class JobListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['nom', 'entreprise', 'dateCandidature', 'status', 'actions'];
  dataSource = new MatTableDataSource<Job>();

  // On récupère une référence au paginator du template
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private jobService: JobService) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  ngAfterViewInit() {
    // On lie le paginator à notre source de données après que la vue soit initialisée
    this.dataSource.paginator = this.paginator;
  }

  loadJobs(): void {
    this.jobService.getAllJobs().subscribe(data => {
      this.dataSource.data = data;
      // On définit une fonction de filtrage personnalisée
      this.dataSource.filterPredicate = (data: Job, filter: string) => {
        return data.entreprise.nom.toLowerCase().includes(filter);
      };
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deleteJob(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      this.jobService.deleteJob(id).subscribe(() => {
        this.loadJobs();
      });
    }
  }
}
