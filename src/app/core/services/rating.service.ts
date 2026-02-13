import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

import { Review } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reviews`;
  
  private reviewsSignal = signal<Review[]>([]);
  
  // Expose readonly signal
  reviews = this.reviewsSignal.asReadonly();

  constructor() {
    this.loadReviews();
  }

  loadReviews() {
    this.http.get<Review[]>(this.apiUrl).subscribe({
      next: (data: Review[]) => this.reviewsSignal.set(data),
      error: (err: any) => console.error('Failed to load reviews', err)
    });
  }

  // Get reviews for a specific target
  getReviews(targetId: string, targetType: 'agent' | 'property') {
    return computed(() => 
      this.reviewsSignal()
        .filter(r => r.targetId === targetId && r.targetType === targetType)
        .sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
    );
  }

  // Get average rating
  getAverageRating(targetId: string, targetType: 'agent' | 'property') {
    return computed(() => {
      const targetReviews = this.reviewsSignal().filter(r => r.targetId === targetId && r.targetType === targetType);
      if (targetReviews.length === 0) return 0;
      const sum = targetReviews.reduce((acc, curr) => acc + curr.rating, 0);
      return Math.round((sum / targetReviews.length) * 10) / 10; // Round to 1 decimal
    });
  }

  // Get reviews count
  getReviewsCount(targetId: string, targetType: 'agent' | 'property') {
    return computed(() => 
      this.reviewsSignal().filter(r => r.targetId === targetId && r.targetType === targetType).length
    );
  }

  // Add a new review
  addReview(targetId: string, targetType: 'agent' | 'property', rating: number, text: string, authorName: string = 'مستخدم', authorAvatar: string = '/assets/images/user-placeholder.png'): Observable<Review> {
    const newReview = {
      targetId,
      targetType,
      rating,
      text,
      author: authorName,
      avatar: authorAvatar,
      date: new Date().toISOString()
    };

    return this.http.post<Review>(this.apiUrl, newReview).pipe(
      tap((savedReview: Review) => {
        this.reviewsSignal.update(reviews => [savedReview, ...reviews]);
      })
    );
  }

  // Delete a review
  deleteReview(id: string) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.reviewsSignal.update(reviews => reviews.filter(r => r.id !== id && r._id !== id));
      },
      error: (err: any) => console.error('Failed to delete review', err)
    });
  }
}
