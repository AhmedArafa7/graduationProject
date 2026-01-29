import { Injectable, signal, computed } from '@angular/core';

export interface Review {
  id: number;
  targetId: number; // agentId or propertyId
  targetType: 'agent' | 'property';
  author: string;
  avatar: string;
  rating: number; // 1-5
  text: string;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  
  private reviewsSignal = signal<Review[]>(this.loadFromStorage());
  
  // Expose readonly signal
  reviews = this.reviewsSignal.asReadonly();

  // Get reviews for a specific target
  getReviews(targetId: number, targetType: 'agent' | 'property') {
    return computed(() => 
      this.reviewsSignal()
        .filter(r => r.targetId === targetId && r.targetType === targetType)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
  }

  // Get average rating
  getAverageRating(targetId: number, targetType: 'agent' | 'property') {
    return computed(() => {
      const targetReviews = this.reviewsSignal().filter(r => r.targetId === targetId && r.targetType === targetType);
      if (targetReviews.length === 0) return 0;
      const sum = targetReviews.reduce((acc, curr) => acc + curr.rating, 0);
      return Math.round((sum / targetReviews.length) * 10) / 10; // Round to 1 decimal
    });
  }

  // Get reviews count
  getReviewsCount(targetId: number, targetType: 'agent' | 'property') {
    return computed(() => 
      this.reviewsSignal().filter(r => r.targetId === targetId && r.targetType === targetType).length
    );
  }

  // Add a new review
  addReview(targetId: number, targetType: 'agent' | 'property', rating: number, text: string, authorName: string = 'مستخدم', authorAvatar: string = '/assets/images/user-placeholder.png') {
    const newReview: Review = {
      id: Date.now(),
      targetId,
      targetType,
      author: authorName,
      avatar: authorAvatar,
      rating,
      text,
      date: new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
    };

    this.reviewsSignal.update(reviews => [newReview, ...reviews]);
    this.saveToStorage();
    return newReview;
  }

  // Delete a review
  deleteReview(id: number) {
    this.reviewsSignal.update(reviews => reviews.filter(r => r.id !== id));
    this.saveToStorage();
  }

  private saveToStorage() {
    try {
      localStorage.setItem('baytology_reviews', JSON.stringify(this.reviewsSignal()));
    } catch (e) {
      console.warn('Could not save reviews to localStorage');
    }
  }

  private loadFromStorage(): Review[] {
    try {
      const stored = localStorage.getItem('baytology_reviews');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not load reviews from localStorage');
    }

    // Default Mock Data
    return [
      {
        id: 1,
        targetId: 1,
        targetType: 'agent',
        author: 'فاطمة علي',
        avatar: 'https://cdn-icons-png.flaticon.com/512/6858/6858504.png',
        rating: 5,
        text: 'تعامل راقي واحترافية عالية. شكراً لك.',
        date: 'منذ أسبوعين'
      },
      {
        id: 2,
        targetId: 1,
        targetType: 'agent',
        author: 'يوسف خالد',
        avatar: 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png',
        rating: 4.5,
        text: 'خبير حقيقي في المنطقة، وفر علينا وقت كثير.',
        date: 'منذ شهر'
      },
      {
        id: 3,
        targetId: 1,
        targetType: 'property',
        author: 'أحمد محمود',
        avatar: 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png',
        rating: 5,
        text: 'الموقع ممتاز جداً والتشطيب عالي الجودة. أنصح به.',
        date: 'منذ 3 أيام'
      }
    ];
  }
}
