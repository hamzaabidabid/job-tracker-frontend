import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';

import { JobService } from '../../services/job.service';
import { Job } from '../../models/job';

@Component({
  selector: 'app-job-form',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatDatepickerModule, MatButtonModule, MatIconModule,
    MatStepperModule
  ],
  templateUrl: './job-form.component.html',
  styleUrls: ['./job-form.component.scss']
})
export class JobFormComponent implements OnInit {
  isEditMode = false;
  jobId: number | null = null;
  isAnalyzing = false;

  step1FormGroup: FormGroup;
  step2FormGroup: FormGroup;
  step3FormGroup: FormGroup;
  sources = ['LinkedIn', 'Indeed', 'Glassdoor', 'Réseau (Networking)', 'Site Carrière', 'Autre'];
  statuses = ['EN_COURS', 'ACCEPTE', 'REFUSE', 'ARCHIVE'];
  urlPattern = new RegExp('^(https?|ftp):\\/\\/[\\-A-Za-z0-9+&@#\\/%?=~_|!:,.;]*[\\-A-Za-z0-9+&@#\\/%=~_|]');

  constructor(
    private fb: FormBuilder,
    private jobService: JobService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Étape 1 : Infos sur le poste
    this.step1FormGroup = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      urlOffre: ['', [Validators.pattern(this.urlPattern)]],
      status: ['', Validators.required],
      dateCandidature: [new Date(), Validators.required],
      dateLancement: [null],
      siteRecommandation: ['']
    });

    // Étape 2 : Infos sur l'entreprise
    this.step2FormGroup = this.fb.group({
      nom: ['', Validators.required],
      ville: [''],
      secteur: [''],
      adresse: [''],
      description: [''], // Description de l'entreprise
      telephone: [''], // Facultatif
      email: ['', [Validators.email]], // Facultatif
    });

    // Étape 3 : Description et Compétences
    this.step3FormGroup = this.fb.group({
      description: [''], // Description de l'offre
      requiredSkills: this.fb.array([])
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.jobId = Number(id);
      this.jobService.getJobById(this.jobId).subscribe(job => {
        // Remplir les formulaires avec les données du job
        this.step1FormGroup.patchValue(job);
        this.step2FormGroup.patchValue(job.entreprise);
        this.step3FormGroup.patchValue(job); // Contient la description de l'offre

        // Remplir les compétences
        if (job.requiredSkills) {
          job.requiredSkills.forEach(skill => this.addSkill(skill.name));
        }
      });
    }
  }

  get requiredSkills() {
    return this.step3FormGroup.get('requiredSkills') as FormArray;
  }

  addSkill(skillName: string = ''): void {
    const skillForm = this.fb.group({
      name: [skillName, Validators.required]
    });
    this.requiredSkills.push(skillForm);
  }

  removeSkill(index: number): void {
    this.requiredSkills.removeAt(index);
  }
  analyzeDescription(): void {
    const description = this.step3FormGroup.get('description')?.value;
    if (!description) {
      return;
    }

    this.isAnalyzing = true;
    this.jobService.extractSkills(description).subscribe({
      next: (skills) => {
        // Vider la liste actuelle
        this.requiredSkills.clear();
        // Ajouter les nouvelles compétences trouvées
        skills.forEach(skill => this.addSkill(skill));
        this.isAnalyzing = false;
      },
      error: (err) => {
        console.error("Erreur lors de l'extraction des compétences", err);
        this.isAnalyzing = false;
        // On pourrait afficher une notification d'erreur à l'utilisateur ici
      }
    });
  }
  onSubmit(): void {
    if (this.step1FormGroup.invalid || this.step2FormGroup.invalid || this.step3FormGroup.invalid) {
      return;
    }

    // On combine les données des 3 formulaires
    const jobData = {
      ...this.step1FormGroup.value,
      description: this.step3FormGroup.value.description, // On prend la description de l'offre de l'étape 3
      entreprise: this.step2FormGroup.value,
      requiredSkills: this.step3FormGroup.value.requiredSkills
    } as Job;

    if (this.isEditMode && this.jobId) {
      this.jobService.updateJob(this.jobId, jobData).subscribe(() => {
        this.router.navigate(['/jobs']);
      });
    } else {
      this.jobService.createJob(jobData).subscribe(() => {
        this.router.navigate(['/jobs']);
      });
    }
  }
}
