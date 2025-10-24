import { Component, OnInit, ViewChild } from '@angular/core';
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
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { Observable } from 'rxjs';
import { JobService } from '../../services/job.service';
import { Job } from '../../models/job';
import { Entreprise } from '../../models/entreprise';

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
  @ViewChild('stepper') private stepper!: MatStepper;

  step1FormGroup: FormGroup;
  step2FormGroup: FormGroup;
  step3FormGroup: FormGroup;

  sources = ['LinkedIn', 'Indeed', 'Glassdoor', 'Réseau (Networking)', 'Site Carrière', 'Autre'];
  statuses = ['EN_COURS', 'ACCEPTE', 'REFUSE', 'ARCHIVE'];
  urlPattern = new RegExp('^(https?|ftp):\\/\\/[\\-A-Za-z0-9+&@#\\/%?=~_|!:,.;]*[\\-A-Za-z0-9+&@#\\/%=~_|]');

  allEntreprises$!: Observable<Entreprise[]>;
  private allEntreprises: Entreprise[] = [];

  constructor(
    private fb: FormBuilder,
    private jobService: JobService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Étape 1 : Infos sur le poste
    this.step1FormGroup = this.fb.group({
      existingEntrepriseId: [null], // Champ pour la sélection
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
      description: [''],
      telephone: [''],
      email: ['', [Validators.email]],
    });

    // Étape 3 : Description et Compétences
    this.step3FormGroup = this.fb.group({
      description: [''],
      requiredSkills: this.fb.array([])
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!id;

    this.allEntreprises$ = this.jobService.getAllEntreprises();
    this.allEntreprises$.subscribe(data => this.allEntreprises = data);

    if (this.isEditMode) {
      // --- LOGIQUE POUR LE MODE ÉDITION ---
      this.jobId = Number(id);
      this.jobService.getJobById(this.jobId).subscribe(job => {
        this.step1FormGroup.patchValue(job);
        this.step2FormGroup.patchValue(job.entreprise);
        this.step3FormGroup.patchValue(job);

        this.step1FormGroup.get('existingEntrepriseId')?.setValue(job.entreprise.id);
        this.step2FormGroup.disable(); // On désactive le formulaire entreprise en mode édition

        this.requiredSkills.clear();
        if (job.requiredSkills) {
          job.requiredSkills.forEach(skill => this.addSkill(skill.name));
        }
      });
    } else {
      // --- LOGIQUE POUR LE MODE CRÉATION ---
      this.step1FormGroup.get('existingEntrepriseId')?.valueChanges.subscribe(entrepriseId => {
        if (entrepriseId) {
          const selectedEntreprise = this.allEntreprises.find(e => e.id === entrepriseId);
          if (selectedEntreprise) {
            this.step2FormGroup.patchValue(selectedEntreprise);
            this.step2FormGroup.disable();
          }
        } else {
          this.step2FormGroup.enable();
          this.step2FormGroup.reset();
        }
      });
    }
  }

  get requiredSkills() {
    return this.step3FormGroup.get('requiredSkills') as FormArray;
  }

  addSkill(skillName: string = ''): void {
    const skillForm = this.fb.group({ name: [skillName, Validators.required] });
    this.requiredSkills.push(skillForm);
  }

  removeSkill(index: number): void {
    this.requiredSkills.removeAt(index);
  }

  analyzeDescription(): void {
    const description = this.step3FormGroup.get('description')?.value;
    if (!description) return;

    this.isAnalyzing = true;
    this.jobService.extractSkills(description).subscribe({
      next: (skills) => {
        this.requiredSkills.clear();
        skills.forEach(skill => this.addSkill(skill));
        this.isAnalyzing = false;
      },
      error: (err) => {
        console.error("Erreur lors de l'extraction des compétences", err);
        this.isAnalyzing = false;
      }
    });
  }

  onSubmit(): void {
    if (this.step1FormGroup.invalid || this.step2FormGroup.invalid || this.step3FormGroup.invalid) {
      return;
    }

    const jobData = {
      ...this.step1FormGroup.value,
      description: this.step3FormGroup.value.description,
      entreprise: this.step2FormGroup.getRawValue(), // getRawValue() pour lire les champs désactivés
      requiredSkills: this.step3FormGroup.value.requiredSkills
    } as Job;

    const selectedId = this.step1FormGroup.get('existingEntrepriseId')?.value;
    if (selectedId) {
      jobData.entreprise.id = selectedId;
    }

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
