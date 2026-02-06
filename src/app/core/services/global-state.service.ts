import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserService } from './user.service';
import { environment } from '../../../environments/environment';

export interface SearchFilters {
  type: string;
  priceFrom: number | null;
  priceTo: number | null;
  beds: string;
  baths: string;
  amenities: {
    pool: boolean;
    garden: boolean;
    garage: boolean;
    balcony: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class GlobalStateService {
  private http = inject(HttpClient);
  private userService = inject(UserService);

  // 1. حالة المفضلة (مشتركة في كل التطبيق)
  // نقوم بحفظها في localStorage لتبقى حتى بعد تحديث الصفحة
  private storedFavs = typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('favorites') || '[]') : [];
  favorites = signal<string[]>(this.storedFavs);

  // 2. حالة فلاتر البحث (للحفاظ عليها عند العودة)
  // 2. حالة فلاتر البحث (للحفاظ عليها عند العودة)
  searchFilters = signal<SearchFilters>({
    type: 'all',
    priceFrom: null,
    priceTo: null,
    beds: 'عدد الغرف',
    baths: 'عدد الحمامات',
    amenities: {
      pool: false,
      garden: false,
      garage: false,
      balcony: false
    }
  });

  // دوال المفضلة
  toggleFavorite(id: string) {
    const userId = this.userService.userData()._id;

    // 1. Optimistic Update (Immediate UI feedback)
    this.favorites.update(current => {
      const newFavs = current.includes(id) 
        ? current.filter(favId => favId !== id) 
        : [...current, id];
      
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('favorites', JSON.stringify(newFavs));
      }
      return newFavs;
    });

    // 2. Persist to Backend if logged in
    if (userId) {
      this.http.post<string[]>(`${environment.apiUrl}/users/${userId}/favorites`, { propertyId: id })
        .subscribe({
          next: (updatedFavorites) => {
             // Optional: Sync from backend to be sure
             // this.favorites.set(updatedFavorites); 
          },
          error: (err) => console.error('Failed to sync favorite', err)
        });
    }
  }

  isFavorite(id: string) {
    return this.favorites().includes(id);
  }

  // دوال الفلاتر
  updateFilters(filters: SearchFilters) {
    this.searchFilters.set({ ...filters }); // نسخ القيم لحفظها
  }

  resetFilters() {
    this.searchFilters.set({
      type: 'all',
      priceFrom: null,
      priceTo: null,
      beds: 'عدد الغرف',
      baths: 'عدد الحمامات',
      amenities: { pool: false, garden: false, garage: false, balcony: false }
    });
  }
}