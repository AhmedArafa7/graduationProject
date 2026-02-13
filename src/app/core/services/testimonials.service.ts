import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

import { Testimonial } from '../models/testimonial.model';

@Injectable({
  providedIn: 'root'
})
export class TestimonialsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/testimonials`;

  private testimonialsSignal = signal<Testimonial[]>([]);

  constructor() {
    this.loadTestimonials();
  }

  loadTestimonials() {
    this.http.get<Testimonial[]>(this.apiUrl).subscribe({
      next: (data) => this.testimonialsSignal.set(data),
      error: (err) => console.error('Failed to load testimonials', err)
    });
  }

  getAllTestimonials() {
    return this.testimonialsSignal();
  }
}
