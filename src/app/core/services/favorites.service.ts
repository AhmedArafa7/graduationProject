import { Injectable, signal, computed, inject } from '@angular/core';
import { PropertyService } from './property.service';
import { Property } from '../models/property.model';
import { GlobalStateService } from './global-state.service';

import { FavoriteProperty } from '../models/favorite.model';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private propertyService = inject(PropertyService);
  private globalState = inject(GlobalStateService);
  
  // IDs المفضلة - نأخذها من GlobalState مباشرة
  private favoriteIds = this.globalState.favorites;

  // العقارات المفضلة (computed من PropertyService)
  favorites = computed(() => {
    const ids = this.favoriteIds();
    // Ensure we have properties loaded
    const allProperties = this.propertyService.properties();
    
    return allProperties
      .filter(p => ids.includes(p._id))
      .map(p => this.mapToFavorite(p));
  });
  
  // عدد المفضلة
  count = computed(() => this.favoriteIds().length);

  // هل العقار في المفضلة؟
  isFavorite(propertyId: string): boolean {
    return this.globalState.isFavorite(propertyId);
  }

  // إضافة للمفضلة
  addToFavorites(propertyId: string) {
    if (!this.isFavorite(propertyId)) {
      this.globalState.toggleFavorite(propertyId);
    }
  }

  // إزالة من المفضلة
  removeFromFavorites(propertyId: string) {
    if (this.isFavorite(propertyId)) {
      this.globalState.toggleFavorite(propertyId);
    }
  }

  // Toggle المفضلة
  toggleFavorite(propertyId: string): boolean {
    this.globalState.toggleFavorite(propertyId);
    return this.isFavorite(propertyId); // Return new state
  }

  // جلب كل الـ IDs المفضلة
  getFavoriteIds(): string[] {
    return this.favoriteIds();
  }

  // تحويل Property إلى FavoriteProperty
  private mapToFavorite(p: Property): FavoriteProperty {
    return {
      id: p._id,
      image: p.coverImage || (p.images && p.images[0]) || '',
      price: p.price,
      address: `${p.location.address || ''}، ${p.location.city || ''}`,
      beds: p.bedrooms,
      baths: p.bathrooms,
      area: p.area,
      type: p.type
    };
  }
}
