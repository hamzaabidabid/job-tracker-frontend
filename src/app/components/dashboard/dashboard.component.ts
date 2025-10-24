import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { Observable } from 'rxjs';
import { Job } from '../../models/job';
import { JobService, DashboardStats } from '../../services/job.service';
import { MatIconModule } from '@angular/material/icon';
import {RouterLink} from '@angular/router'; // Importer MatIconModule

@Component({
  selector: 'app-dashboard',
  standalone: true,
  // AJOUTER MatIconModule
  imports: [CommonModule, MatCardModule, MatListModule, NgxChartsModule, MatIconModule ,RouterLink ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  latestJobs$!: Observable<Job[]>;
  dashboardStats$!: Observable<DashboardStats>;

  // Options pour les graphiques

  gradient: boolean = false;
  showLegend: boolean = true;
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  showXAxisLabel: boolean = true;
  showYAxisLabel: boolean = true;
  xAxisLabelCity: string = 'Ville';
  xAxisLabelSite: string = 'Site de Recommandation';
  yAxisLabel: string = 'Nombre de candidatures';

  constructor(private jobService: JobService) {}

  ngOnInit(): void {
    this.latestJobs$ = this.jobService.getLatestJobs();
    this.dashboardStats$ = this.jobService.getDashboardStats();
  }
}
