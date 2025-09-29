import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Job } from '../models/job';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private apiUrl = 'http://localhost:8082/api/jobs';
  private apiUrl2 = 'http://localhost:8082/api';// URL de votre API Spring Boot

  constructor(private http: HttpClient) { }


  extractSkills(description: string): Observable<string[]> {
    return this.http.post<string[]>(`${this.apiUrl2}/nlp/extract-skills`, description, {
      headers: { 'Content-Type': 'text/plain' } // Important : on envoie du texte brut
    });
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
  getLatestJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.apiUrl}/latest`);
  }

  getJobsWithRecentResponse(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.apiUrl}/recent-responses`);
  }

  getExpiringJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.apiUrl}/expiring-soon`);
  }

  getJobsByCityStats(): Observable<any[]> { // On attend un tableau, c'est bon
    return this.http.get<any[]>(`${this.apiUrl}/stats/by-city`);
  }
}
