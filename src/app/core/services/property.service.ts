import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

import { Property, PropertyAmenity, PropertyAiAnalysis } from '../models/property.model';
import { Agent } from '../models/agent.model';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/properties`;
  
  // State
  private propertiesSignal = signal<Property[]>([]);

  // Selectors
  properties = computed(() => this.propertiesSignal());

  private platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadProperties();
    }
  }

  loadProperties() {
    this.http.get<any[]>(this.apiUrl).pipe(
      map(data => data.map(item => this.mapBackendToFrontend(item)))
    ).subscribe({
      next: (properties) => this.propertiesSignal.set(properties),
      error: (err: any) => console.error('Failed to load properties', err)
    });
  }

  private mapBackendToFrontend(item: any): Property {
    return {
      _id: item._id,
      title: item.title,
      description: item.description,
      price: item.price,
      currency: item.currency || 'EGP',
      area: item.area,
      location: item.location,
      type: item.type,
      propertyType: item.propertyType,
      bedrooms: item.bedrooms,
      bathrooms: item.bathrooms,
      floor: item.floor,
      images: item.images || [],
      coverImage: item.coverImage,
      features: item.features || [],
      agent: item.agent,
      createdAt: item.createdAt,
      isFeatured: item.isFeatured,
      status: item.status,
      // Map features array to amenities object for UI
      amenities: this.mapFeaturesToAmenities(item.features || [])
    };
  }

  private mapFeaturesToAmenities(features: string[]): PropertyAmenity[] {
    const amenityMap: { [key: string]: string } = {
      'pool': 'حمامات سباحة',
      'garage': 'جراج',
      'gym': 'صالة رياضة',
      'garden': 'حديقة',
      'balcony': 'بلكونة',
      'security': 'أمن 24/7',
      'ac': 'تكييف',
      'petFriendly': 'يسمح بالحيوانات'
    };

    return features.map(f => ({
      icon: this.getIconForFeature(f),
      label: amenityMap[f] || f
    }));
  }

  private getIconForFeature(feature: string): string {
    const iconMap: { [key: string]: string } = {
      'pool': 'pool',
      'garage': 'directions_car',
      'gym': 'fitness_center',
      'garden': 'local_florist',
      'balcony': 'deck',
      'security': 'security',
      'ac': 'ac_unit',
      'petFriendly': 'pets'
    };
    return iconMap[feature] || 'check_circle';
  }

  // Get property by ID (Repository Pattern: Cache First -> API Fallback)
  getPropertyById(id: string): Observable<Property | undefined> {
    const existing = this.propertiesSignal().find(p => p._id === id);
    if (existing) {
      // 1. Return from cache immediately
      return new Observable(obs => {
        obs.next(existing);
        obs.complete();
      });
      // OR simpler: return of(existing); (requires import { of })
    }

    // 2. Fetch from API
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(item => this.mapBackendToFrontend(item))
    );
  }
  
  // Featured Properties
  getFeaturedProperties(): Property[] {
    return this.propertiesSignal().filter(p => p.isFeatured || !!p.tag);
  }

  // Search
  searchProperties(query: string): Property[] {
    const q = query.toLowerCase();
    return this.propertiesSignal().filter(p => 
      p.title.toLowerCase().includes(q) ||
      (p.location.address && p.location.address.toLowerCase().includes(q)) ||
      (p.location.city && p.location.city.toLowerCase().includes(q))
    );
  }

  // Filter by Type
  getByType(type: 'sale' | 'rent'): Property[] {
    return this.propertiesSignal().filter(p => p.type === type);
  }
}
