import { Injectable, signal, computed } from '@angular/core';

export interface Property {
  id: number;
  title: string;
  price: string;
  priceValue: number;
  address: string;
  city: string;
  beds: number;
  baths: number;
  area: string;
  areaValue: number;
  type: 'sale' | 'rent';
  propertyType: 'apartment' | 'villa' | 'house' | 'land' | 'commercial';
  images: string[];
  description: string;
  features: string[];
  agent: {
    name: string;
    phone: string;
    avatar: string;
  };
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  
  // جميع العقارات
  private propertiesSignal = signal<Property[]>([
    {
      id: 1,
      title: 'شقة فاخرة بإطلالة على النيل',
      price: '500,000 جنيه',
      priceValue: 500000,
      address: 'شارع النيل، الزمالك',
      city: 'القاهرة',
      beds: 3,
      baths: 2,
      area: '180 م²',
      areaValue: 180,
      type: 'sale',
      propertyType: 'apartment',
      images: [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=800&auto=format&fit=crop'
      ],
      description: 'شقة فاخرة في قلب الزمالك بإطلالة مباشرة على نهر النيل. تشطيب سوبر لوكس مع جميع المرافق الحديثة.',
      features: ['بلكونة', 'جراج', 'أمن 24 ساعة', 'تكييف مركزي', 'مصعد'],
      agent: {
        name: 'أحمد محمد',
        phone: '01012345678',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
      },
      createdAt: '2026-01-15'
    },
    {
      id: 2,
      title: 'شقة للإيجار في التجمع الخامس',
      price: '2,500 جنيه/شهر',
      priceValue: 2500,
      address: 'شارع التسعين، التجمع الخامس',
      city: 'القاهرة الجديدة',
      beds: 2,
      baths: 2,
      area: '120 م²',
      areaValue: 120,
      type: 'rent',
      propertyType: 'apartment',
      images: [
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800&auto=format&fit=crop'
      ],
      description: 'شقة مفروشة بالكامل في موقع متميز بالتجمع الخامس. قريبة من جميع الخدمات.',
      features: ['مفروشة', 'تكييف', 'إنترنت', 'قريبة من المواصلات'],
      agent: {
        name: 'سارة أحمد',
        phone: '01098765432',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
      },
      createdAt: '2026-01-14'
    },
    {
      id: 3,
      title: 'فيلا فاخرة في المعادي',
      price: '750,000 جنيه',
      priceValue: 750000,
      address: 'المعادي الجديدة',
      city: 'القاهرة',
      beds: 4,
      baths: 3,
      area: '220 م²',
      areaValue: 220,
      type: 'sale',
      propertyType: 'villa',
      images: [
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop'
      ],
      description: 'فيلا مستقلة بحديقة خاصة في المعادي الجديدة. تصميم عصري وموقع هادئ.',
      features: ['حديقة', 'مسبح', 'جراج مزدوج', 'غرفة خادمة', 'أمن'],
      agent: {
        name: 'محمد علي',
        phone: '01155566677',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
      },
      createdAt: '2026-01-12'
    }
  ]);

  // للقراءة
  properties = computed(() => this.propertiesSignal());

  // جلب عقار بالـ ID
  getPropertyById(id: number): Property | undefined {
    return this.propertiesSignal().find(p => p.id === id);
  }

  // البحث عن عقارات
  searchProperties(query: string): Property[] {
    const q = query.toLowerCase();
    return this.propertiesSignal().filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q)
    );
  }

  // فلترة حسب النوع
  getByType(type: 'sale' | 'rent'): Property[] {
    return this.propertiesSignal().filter(p => p.type === type);
  }
}
