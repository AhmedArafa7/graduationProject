import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserService } from './user.service';
import { environment } from '../../../environments/environment';
import { Observable, map } from 'rxjs';

import { AgentProperty, PropertyAmenities, RoomDimension } from '../models/agent-property.model';

@Injectable({
  providedIn: 'root'
})
export class AgentPropertiesService {
  private http = inject(HttpClient);
  private user = inject(UserService); // To get current user ID
  private apiUrl = `${environment.apiUrl}/properties`;
  
  // No more signals for local state - fetch on demand or use a resource pattern
  // For simplicity, we will return Observables directly

  // Get all properties for the current agent
  getAgentProperties(): Observable<AgentProperty[]> {
    const userId = this.user.userData()._id;
    if (!userId) return new Observable(obs => obs.next([]));
    
    return this.http.get<any[]>(`${this.apiUrl}?agent=${userId}`).pipe(
      map(items => items.map(this.mapBackendToFrontend))
    );
  }

  // Get single property
  getPropertyById(id: string): Observable<AgentProperty> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(this.mapBackendToFrontend)
    );
  }

  // Add new property
  addProperty(property: any): Observable<AgentProperty> {
    const backendPayload = this.mapFrontendToBackend(property);
    return this.http.post<any>(this.apiUrl, backendPayload).pipe(
      map(this.mapBackendToFrontend)
    );
  }

  // Delete property
  deleteProperty(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Update property
  updateProperty(id: string, updates: Partial<AgentProperty>): Observable<AgentProperty> {
    // Note: This relies on backend accepting partial updates (PATCH/PUT)
    // We might need to map updates to backend structure too
    const backendPayload = this.mapFrontendToBackend(updates as any); // Partial mapping might be tricky, assuming full object or compatible structure
    return this.http.put<any>(`${this.apiUrl}/${id}`, backendPayload).pipe(
      map(this.mapBackendToFrontend)
    );
  }

  // HELPER: Map Backend Schema -> Frontend Interface
  private mapBackendToFrontend(item: any): AgentProperty {
    return {
      id: item._id,
      image: item.coverImage || (item.images && item.images[0]) || '',
      images: item.images || [],
      address: item.location?.address || item.title,
      price: item.price + ' جنيه', // Format as needed
      priceValue: item.price,
      status: item.status === 'available' ? 'للبيع' : (item.status === 'rented' ? 'للإيجار' : 'مباع'), // Mapping needed
      statusColor: item.status === 'available' ? 'bg-green-600' : 'bg-red-600', // Simplified
      createdAt: item.createdAt,
      propertyType: item.propertyType,
      area: item.area,
      bedrooms: item.bedrooms,
      bathrooms: item.bathrooms,
      floor: item.floor,
      description: item.description,
      amenities: {
          pool: item.features?.includes('pool'),
          garage: item.features?.includes('garage'),
          gym: item.features?.includes('gym'),
          garden: item.features?.includes('garden'),
          balcony: item.features?.includes('balcony'),
          security: item.features?.includes('security'),
          ac: item.features?.includes('ac'),
          petFriendly: item.features?.includes('petFriendly')
      },
      latitude: item.location?.coordinates?.coordinates[1]?.toString(),
      longitude: item.location?.coordinates?.coordinates[0]?.toString(),
      locationId: item._id // use ID as location ID
    };
  }

  // HELPER: Map Frontend Interface -> Backend Schema
  private mapFrontendToBackend(data: any): any {
    const features: string[] = [];
    if (data.amenities?.pool) features.push('pool');
    if (data.amenities?.garage) features.push('garage');
    if (data.amenities?.gym) features.push('gym');
    if (data.amenities?.garden) features.push('garden');
    if (data.amenities?.balcony) features.push('balcony');
    if (data.amenities?.security) features.push('security');
    if (data.amenities?.ac) features.push('ac');
    if (data.amenities?.petFriendly) features.push('petFriendly');

    return {
      title: data.address || data.title, // 'address' in frontend often used as title
      description: data.description || 'No description',
      price: data.priceValue || parseInt(data.price),
      area: data.area,
      location: {
        city: 'القاهرة', // DEFAULT for now as it's missing in frontend form
        address: data.address || 'Cairo',
        coordinates: {
          type: 'Point',
          coordinates: [
            parseFloat(data.longitude || '31.2357'), 
            parseFloat(data.latitude || '30.0444')
          ]
        }
      },
      type: data.status === 'للإيجار' ? 'rent' : 'sale',
      propertyType: this.mapPropertyType(data.propertyType), 
      bedrooms: data.bedrooms || 1,
      bathrooms: data.bathrooms || 1,
      floor: data.floor || 0,
      images: data.images || (data.image ? [data.image] : []),
      coverImage: data.image || (data.images && data.images[0]), // First image as cover
      features: features,
      status: data.status === 'مباع' ? 'sold' : 'available',
      agent: this.user.userData()._id // Link to current agent
    };
  }

  private mapPropertyType(type: string): string {
    const map: any = {
      'شقة': 'apartment',
      'فيلا': 'villa',
      'تاون هاوس': 'house',
      'شاليه': 'chalet',
      'أرض': 'land',
      'تجاري': 'commercial'
    };
    return map[type] || 'apartment';
  }
}
