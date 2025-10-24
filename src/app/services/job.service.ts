import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, BehaviorSubject, tap} from 'rxjs';
import { Job } from '../models/job';
import {Entreprise} from '../models/entreprise';
import { Stat } from '../models/Stat';

export interface DashboardStats {
  totalApplications: number;
  refusedApplications: number;
  pendingApplications: number;
  applicationsByCity: Stat[];
  applicationsBySite: Stat[];
}
@Injectable({
  providedIn: 'root'
})
export class JobService {
  private apiUrl = 'http://localhost:8082/api/jobs';
  private apiUrl2 = 'http://localhost:8082/api';// URL de votre API Spring Boot

  private favoriteJobIds = new BehaviorSubject<Set<number>>(new Set());

  // Un Observable public que les composants pourront écouter.
  public favoriteJobIds$ = this.favoriteJobIds.asObservable();

  constructor(private http: HttpClient) { this.loadInitialFavorites();}

  private loadInitialFavorites(): void {
    this.getFavoriteJobs().subscribe(favoriteJobs => {
      const ids = new Set(favoriteJobs.map(job => job.id));
      this.favoriteJobIds.next(ids); // On met à jour le BehaviorSubject
    });
  }

  extractSkills(description: string): Observable<string[]> {
    return this.http.post<string[]>(`${this.apiUrl2}/nlp/extract-skills`, description, {
      headers: { 'Content-Type': 'text/plain' } // Important : on envoie du texte brut
    });
  }

  getAllEntreprises(): Observable<Entreprise[]> {
    return this.http.get<Entreprise[]>(`${this.apiUrl2}/entreprises`);
  }
  // --- Opérations CRUD de base ---
  getAllJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(this.apiUrl);
  }

  getJobById(id: number): Observable<Job> {
    return this.http.get<Job>(`${this.apiUrl}/${id}`);
  }

  createJob(job: Job): Observable<Job> {
    return this.http.post<Job>(this.apiUrl, job);
  }

  updateJob(id: number, job: Job): Observable<Job> {
    return this.http.put<Job>(`${this.apiUrl}/${id}`, job);
  }

  deleteJob(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // --- Endpoints pour le Dashboard ---


  getJobsWithRecentResponse(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.apiUrl}/recent-responses`);
  }

  getExpiringJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.apiUrl}/expiring-soon`);
  }

  getJobsByCityStats(): Observable<any[]> { // On attend un tableau, c'est bon
    return this.http.get<any[]>(`${this.apiUrl}/stats/by-city`);
  }
  getLatestJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.apiUrl}/latest`);
  }

  // NOUVELLE MÉTHODE
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }
  getFavoriteJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.apiUrl}/favorites`);
  }

  // La méthode toggleFavorite devient le point central de la mise à jour.
  toggleFavorite(id: number): Observable<Job> {
    return this.http.patch<Job>(`${this.apiUrl}/${id}/favorite`, {}).pipe(
      // 'tap' permet d'exécuter du code avec le résultat sans modifier la réponse.
      tap(updatedJob => {
        // On récupère la liste actuelle des IDs favoris.
        const currentIds = this.favoriteJobIds.getValue();

        if (updatedJob.isFavorite) {
          // Si le job est maintenant un favori, on ajoute son ID.
          currentIds.add(updatedJob.id);
        } else {
          // Sinon, on le retire.
          currentIds.delete(updatedJob.id);
        }

        // On notifie tous les composants qui écoutent que la liste des favoris a changé.
        this.favoriteJobIds.next(new Set(currentIds));
      })
    );
  }
}
