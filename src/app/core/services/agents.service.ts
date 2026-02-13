import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, of } from 'rxjs';

import { Agent } from '../models/agent.model';

@Injectable({
  providedIn: 'root'
})
export class AgentsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  private agentsSignal = signal<Agent[]>([]);
  public agents = computed(() => this.agentsSignal());

  constructor() {
    this.loadAgents();
  }

  loadAgents() {
    // Fetch users with type 'agent'
    this.http.get<Agent[]>(`${this.apiUrl}?userType=agent`).subscribe({
      next: (data) => {
        this.agentsSignal.set(data);
      },
      error: (err) => console.error('Failed to load agents', err)
    });
  }

  getAgent(id: string): Observable<Agent> {
    const existingAgent = this.agentsSignal().find(a => a._id === id);
    if (existingAgent) {
      return of(existingAgent);
    }
    return this.http.get<Agent>(`${this.apiUrl}/${id}`);
  }
}
