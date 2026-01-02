import { Injectable, signal, computed } from '@angular/core';

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
  // 1. حالة المفضلة (مشتركة في كل التطبيق)
  // نقوم بحفظها في localStorage لتبقى حتى بعد تحديث الصفحة
  private storedFavs = typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('favorites') || '[]') : [];
  favorites = signal<number[]>(this.storedFavs);

  // 2. حالة فلاتر البحث (للحفاظ عليها عند العودة)
  searchFilters = signal<SearchFilters>({
    type: 'شقة',
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
  toggleFavorite(id: number) {
    this.favorites.update(current => {
      const newFavs = current.includes(id) 
        ? current.filter(favId => favId !== id) 
        : [...current, id];
      
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('favorites', JSON.stringify(newFavs));
      }
      return newFavs;
    });
  }

  isFavorite(id: number) {
    return this.favorites().includes(id);
  }

  // دوال الفلاتر
  updateFilters(filters: SearchFilters) {
    this.searchFilters.set({ ...filters }); // نسخ القيم لحفظها
  }

  resetFilters() {
    this.searchFilters.set({
      type: 'شقة',
      priceFrom: null,
      priceTo: null,
      beds: 'عدد الغرف',
      baths: 'عدد الحمامات',
      amenities: { pool: false, garden: false, garage: false, balcony: false }
    });
  }
}