import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, map, of, catchError } from 'rxjs';
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
      map(data => {
        // --- DUMMY DATA FOR TESTING WHEN DB IS EMPTY ---
        if (!data || data.length === 0) {
          data = [
            {
              _id: '6985e95c9e19c31acb5b75a2',
              title: 'فيلا فاخرة بتشطيب سوبر لوكس',
              description: 'فيلا رائعة تتميز بتصميم عصري وإطلالة بانورامية مزدوجة. تحتوي على مساحات واسعة وغرف نوم ماستر. مثالية للعائلات التي تبحث عن الفخامة والخصوصية في قلب المدينة.',
              price: 15000000,
              currency: 'EGP',
              area: 450,
              location: {
                city: 'القاهرة الجديدة',
                address: 'التجمع الخامس, شارع التسعين الجنوبي',
                coordinates: {
                  type: 'Point',
                  coordinates: [31.4500, 30.0100]
                }
              },
              type: 'sale',
              propertyType: 'villa',
              bedrooms: 5,
              bathrooms: 4,
              floor: 0,
              images: [
                'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1622866306950-81d17097d458?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
              ],
              coverImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              features: ['pool', 'garage', 'garden', 'security', 'ac'],
              agent: {
                _id: 'agent_123',
                firstName: 'أحمد',
                lastName: 'عرفة',
                email: 'ahmed@baytology.com',
                phone: '01012345678',
                profileImage: 'https://i.pravatar.cc/150?u=ahmed',
                agentProfile: {
                  company: 'بيتولوجي للعقارات',
                  rating: 4.8,
                  reviewsCount: 124
                }
              },
              createdAt: new Date().toISOString(),
              isFeatured: true,
              status: 'available'
            }
          ];
        }
        // -----------------------------------------------
        
        return data.map(item => this.mapBackendToFrontend(item));
      })
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
      map(item => {
        if (!item) throw new Error('Property not found');
        return this.mapBackendToFrontend(item);
      }),
      catchError(err => {
        // If backend returns 404 or any error, check if we are requesting our dummy ID
        if (id === '6985e95c9e19c31acb5b75a2') {
           const dummy = this.propertiesSignal().find(p => p._id === id);
           if (dummy) return of(dummy);
        }
        throw err;
      })
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
