import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider'; // <-- NOUVEL IMPORT
import { MatIconModule } from '@angular/material/icon';     // <-- NOUVEL IMPORT
import { Observable } from 'rxjs';
import { Job } from '../../models/job';
import { JobService } from '../../services/job.service';
import { FormatDescriptionPipe } from '../../pipes/format-description.pipe';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    FormatDescriptionPipe,
    MatDividerModule, // <-- AJOUTEZ-LE ICI
    MatIconModule     // <-- AJOUTEZ-LE ICI
  ],
  templateUrl: './job-detail.component.html',
  styleUrls: ['./job-detail.component.scss']
})
export class JobDetailComponent implements OnInit {
  job$!: Observable<Job>;

  constructor(
    private route: ActivatedRoute,
    private jobService: JobService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.job$ = this.jobService.getJobById(id);
  }
}
