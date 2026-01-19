import { Injectable, signal } from '@angular/core';

export interface PropertyAmenities {
  pool: boolean;
  garage: boolean;
  gym: boolean;
  garden: boolean;
  balcony: boolean;
  security: boolean;
  ac: boolean;
  petFriendly: boolean;
}

export interface RoomDimension {
  name: string;
  length: number | null;
  width: number | null;
}

export interface AgentProperty {
  id: number;
  image: string;
  address: string;
  price: string;
  status: 'للبيع' | 'للإيجار' | 'مباع' | 'معلق';
  statusColor: string;
  createdAt: string;
  // Extended fields
  propertyType?: string;
  priceValue?: number;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  roomDimensions?: RoomDimension[];
  description?: string;
  latitude?: string;
  longitude?: string;
  locationId?: string;
  amenities?: PropertyAmenities;
  images?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AgentPropertiesService {
  
  private propertiesSignal = signal<AgentProperty[]>(this.loadFromStorage());

  properties = this.propertiesSignal.asReadonly();

  // جلب عقار بالـ ID
  getPropertyById(id: number): AgentProperty | undefined {
    return this.propertiesSignal().find(p => p.id === id);
  }

  // إضافة عقار جديد
  addProperty(property: Omit<AgentProperty, 'id' | 'createdAt' | 'statusColor'>) {
    const newProperty: AgentProperty = {
      ...property,
      id: Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
      statusColor: this.getStatusColor(property.status)
    };
    
    this.propertiesSignal.update(list => [newProperty, ...list]);
    this.saveToStorage();
    return newProperty;
  }

  // حذف عقار
  deleteProperty(id: number) {
    this.propertiesSignal.update(list => list.filter(p => p.id !== id));
    this.saveToStorage();
  }

  // تحديث عقار
  updateProperty(id: number, updates: Partial<AgentProperty>) {
    this.propertiesSignal.update(list => 
      list.map(p => {
        if (p.id === id) {
          const updated = { ...p, ...updates };
          if (updates.status) {
            updated.statusColor = this.getStatusColor(updates.status);
          }
          return updated;
        }
        return p;
      })
    );
    this.saveToStorage();
  }

  private getStatusColor(status: string): string {
    switch (status) {
      case 'للإيجار': return 'bg-blue-600';
      case 'مباع': return 'bg-red-600';
      case 'معلق': return 'bg-yellow-600';
      default: return 'bg-green-600';
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('agent_properties', JSON.stringify(this.propertiesSignal()));
    } catch (e) {
      console.warn('Could not save properties to localStorage');
    }
  }

  private loadFromStorage(): AgentProperty[] {
    try {
      const stored = localStorage.getItem('agent_properties');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not load properties from localStorage');
    }
    
    return [
      {
        id: 1,
        image: 'https://images.unsplash.com/photo-1600596542815-e32cb51813b9?q=80&w=200&auto=format&fit=crop',
        address: 'شارع النيل، الزمالك، القاهرة',
        price: '1,200,000 جنيه',
        priceValue: 1200000,
        status: 'للبيع',
        statusColor: 'bg-green-600',
        createdAt: '2026-01-15',
        propertyType: 'شقة',
        area: 180,
        bedrooms: 3,
        bathrooms: 2,
        floor: 5,
        description: 'شقة فاخرة تطل على النيل مباشرة',
        amenities: { pool: false, garage: true, gym: false, garden: false, balcony: true, security: true, ac: true, petFriendly: false }
      },
      {
        id: 2,
        image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=200&auto=format&fit=crop',
        address: 'شارع التسعين، التجمع الخامس',
        price: '850,000 جنيه',
        priceValue: 850000,
        status: 'مباع',
        statusColor: 'bg-red-600',
        createdAt: '2026-01-14',
        propertyType: 'شقة',
        area: 150,
        bedrooms: 2,
        bathrooms: 1,
        floor: 3
      },
      {
        id: 3,
        image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=200&auto=format&fit=crop',
        address: 'المعادي، القاهرة',
        price: '8,500 جنيه/شهر',
        priceValue: 8500,
        status: 'للإيجار',
        statusColor: 'bg-blue-600',
        createdAt: '2026-01-12',
        propertyType: 'شقة',
        area: 120,
        bedrooms: 2,
        bathrooms: 1,
        floor: 2
      },
      {
        id: 4,
        image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=200&auto=format&fit=crop',
        address: 'الشيخ زايد، 6 أكتوبر',
        price: '2,100,000 جنيه',
        priceValue: 2100000,
        status: 'معلق',
        statusColor: 'bg-yellow-600',
        createdAt: '2026-01-10',
        propertyType: 'فيلا',
        area: 350,
        bedrooms: 5,
        bathrooms: 4,
        floor: 0,
        amenities: { pool: true, garage: true, gym: false, garden: true, balcony: true, security: true, ac: true, petFriendly: true }
      }
    ];
  }
}
