import { Injectable, signal, computed, inject } from '@angular/core';
import { PropertyService, Property } from './property.service';

export interface FavoriteProperty {
  id: string; // Changed to string
  image: string;
  price: number; // Changed to number
  address: string;
  beds: number;
  baths: number;
  area: number; // Changed to number
  type: 'sale' | 'rent';
}

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private propertyService = inject(PropertyService);
  
  // استخدام نفس الـ key الموجود في GlobalStateService
  private storedFavs = typeof localStorage !== 'undefined' 
    ? JSON.parse(localStorage.getItem('favorites') || '[]') 
    : [];
  
  // IDs المفضلة
  private favoriteIds = signal<string[]>(this.storedFavs);

  // العقارات المفضلة (computed من PropertyService)
  favorites = computed(() => {
    const ids = this.favoriteIds();
    return this.propertyService.properties()
      .filter(p => ids.includes(p._id))
      .map(p => this.mapToFavorite(p));
  });
  
  // عدد المفضلة
  count = computed(() => this.favoriteIds().length);

  // هل العقار في المفضلة؟
  isFavorite(propertyId: string): boolean {
    return this.favoriteIds().includes(propertyId);
  }

  // إضافة للمفضلة
  addToFavorites(propertyId: string) {
    if (!this.isFavorite(propertyId)) {
      this.favoriteIds.update(ids => [...ids, propertyId]);
      this.saveToStorage();
    }
  }

  // إزالة من المفضلة
  removeFromFavorites(propertyId: string) {
    this.favoriteIds.update(ids => ids.filter(id => id !== propertyId));
    this.saveToStorage();
  }

  // Toggle المفضلة
  toggleFavorite(propertyId: string): boolean {
    if (this.isFavorite(propertyId)) {
      this.removeFromFavorites(propertyId);
      return false;
    } else {
      this.addToFavorites(propertyId);
      return true;
    }
  }

  // جلب كل الـ IDs المفضلة
  getFavoriteIds(): string[] {
    return this.favoriteIds();
  }

  // تحويل Property إلى FavoriteProperty
  private mapToFavorite(p: Property): FavoriteProperty {
    return {
      id: p._id,
      image: p.images[0],
      price: p.price,
      address: `${p.location.address || ''}، ${p.location.city || ''}`,
      beds: p.bedrooms,
      baths: p.bathrooms,
      area: p.area,
      type: p.type
    };
  }

  // حفظ في localStorage - نفس الـ key المستخدم في GlobalStateService
  private saveToStorage() {
    try {
      localStorage.setItem('favorites', JSON.stringify(this.favoriteIds()));
    } catch (e) {
      console.warn('Could not save favorites to localStorage');
    }
  }
}
