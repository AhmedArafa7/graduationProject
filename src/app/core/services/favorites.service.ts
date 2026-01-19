import { Injectable, signal, computed, inject } from '@angular/core';
import { PropertyService, Property } from './property.service';

export interface FavoriteProperty {
  id: number;
  image: string;
  price: string;
  address: string;
  beds: number;
  baths: number;
  area: string;
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
  private favoriteIds = signal<number[]>(this.storedFavs);

  // العقارات المفضلة (computed من PropertyService)
  favorites = computed(() => {
    const ids = this.favoriteIds();
    return this.propertyService.properties()
      .filter(p => ids.includes(p.id))
      .map(p => this.mapToFavorite(p));
  });
  
  // عدد المفضلة
  count = computed(() => this.favoriteIds().length);

  // هل العقار في المفضلة؟
  isFavorite(propertyId: number): boolean {
    return this.favoriteIds().includes(propertyId);
  }

  // إضافة للمفضلة
  addToFavorites(propertyId: number) {
    if (!this.isFavorite(propertyId)) {
      this.favoriteIds.update(ids => [...ids, propertyId]);
      this.saveToStorage();
    }
  }

  // إزالة من المفضلة
  removeFromFavorites(propertyId: number) {
    this.favoriteIds.update(ids => ids.filter(id => id !== propertyId));
    this.saveToStorage();
  }

  // Toggle المفضلة
  toggleFavorite(propertyId: number): boolean {
    if (this.isFavorite(propertyId)) {
      this.removeFromFavorites(propertyId);
      return false;
    } else {
      this.addToFavorites(propertyId);
      return true;
    }
  }

  // جلب كل الـ IDs المفضلة
  getFavoriteIds(): number[] {
    return this.favoriteIds();
  }

  // تحويل Property إلى FavoriteProperty
  private mapToFavorite(p: Property): FavoriteProperty {
    return {
      id: p.id,
      image: p.images[0],
      price: p.price,
      address: `${p.address}، ${p.city}`,
      beds: p.beds,
      baths: p.baths,
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
