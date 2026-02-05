import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

// Interfaces matching Backend Schema
export interface Agent {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city?: string; // Added for location filtering
  profileImage: string;
  userType: 'agent';
  agentProfile: {
    title: string;
    licenseNumber: string;
    company: string;
    experience: string;
    specialization: string;
    bio: string;
    rating: number;
    reviewsCount: number;
    activeProperties: number;
    verified: boolean;
    socialLinks: {
      facebook: string;
      linkedin: string;
      twitter: string;
    };
  };
}

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

  getAgentById(id: string): Agent | undefined {
    return this.agentsSignal().find(a => a._id === id);
  }
}
