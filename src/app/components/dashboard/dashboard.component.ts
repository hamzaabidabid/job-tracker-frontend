import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { Observable } from 'rxjs';
import { Job } from '../../models/job';
import { JobService } from '../../services/job.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule, NgxChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  latestJobs$!: Observable<Job[]>;
  expiringJobs$!: Observable<Job[]>;
  recentResponseJobs$!: Observable<Job[]>;
  jobsByCityData$!: Observable<any[]>;

  view: [number, number] = [700, 400];
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Ville';
  showYAxisLabel = true;
  yAxisLabel = 'Nombre de candidatures';

  constructor(private jobService: JobService) {}

  ngOnInit(): void {
    this.latestJobs$ = this.jobService.getLatestJobs();
    this.expiringJobs$ = this.jobService.getExpiringJobs();
    this.recentResponseJobs$ = this.jobService.getJobsWithRecentResponse();
    this.jobsByCityData$ = this.jobService.getJobsByCityStats();
  }
}
