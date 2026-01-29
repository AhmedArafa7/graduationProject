import { Injectable, signal, computed } from '@angular/core';

export interface PropertyAmenity {
  icon: string;
  label: string;
}

export interface PropertyAiAnalysis {
  status: 'high' | 'fair' | 'low';
  percentage: number;
  label: string;
}

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
  propertyType: 'apartment' | 'villa' | 'house' | 'land' | 'chalet' | 'commercial' | 'duplex' | 'penthouse'; // Added types
  images: string[];
  description: string;
  features: string[]; // Simple string array features
  amenities?: PropertyAmenity[]; // Rich icon+label amenities
  agent: {
    name: string;
    phone: string;
    avatar: string;
    title?: string;
    rating?: number;
    deals?: number;
    experience?: string;
  };
  createdAt: string;
  tag?: string;
  refCode?: string;
  floor?: string;
  mapPosition?: { top: string; left: string };
  aiAnalysis?: PropertyAiAnalysis;
}

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  
  // All Properties (Consolidated Mock Data)
  private propertiesSignal = signal<Property[]>([
    {
      id: 1,
      title: 'فيلا مودرن في التجمع الخامس',
      price: '12,000,000',
      priceValue: 12000000,
      address: 'القاهرة الجديدة',
      city: 'القاهرة',
      beds: 5,
      baths: 6,
      area: '450 م²',
      areaValue: 450,
      type: 'sale',
      propertyType: 'villa',
      images: [
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600596542815-e32cb51813b9?q=80&w=1000&auto=format&fit=crop'
      ],
      description: 'فيلا فاخرة بتصميم مودرن في أرقى أحياء التجمع الخامس. حديقة واسعة وحمام سباحة خاص.',
      features: ['حديقة', 'مسبح', 'جراج', 'غرفة خادمة', 'تشطيب سوبر لوكس'],
      amenities: [
        { icon: 'pool', label: 'مسبح' },
        { icon: 'local_parking', label: 'جراج' },
        { icon: 'park', label: 'حديقة' }
      ],
      agent: {
        name: 'أحمد ماهر',
        phone: '01012345678',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop',
        title: 'مستشار عقاري'
      },
      createdAt: '2026-01-20',
      tag: 'مقترح لك',
      refCode: 'SKN-101',
      aiAnalysis: { status: 'fair', percentage: 60, label: 'سعر عادل' },
      mapPosition: { top: '40%', left: '60%' }
    },
    {
      id: 2,
      title: 'شقة بإطلالة على النيل',
      price: '5,500,000',
      priceValue: 5500000,
      address: 'الزمالك',
      city: 'القاهرة',
      beds: 3,
      baths: 2,
      area: '210 م²',
      areaValue: 210,
      type: 'sale',
      propertyType: 'apartment',
      images: [
        'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000&auto=format&fit=crop'
      ],
      description: 'شقة سكنية بفيو بانورامي على النيل مباشرة في منطقة الزمالك الهادئة.',
      features: ['بلكونة', 'أمن', 'مصعد', 'تكييف مركزي'],
      amenities: [
         { icon: 'balcony', label: 'شرفة' },
         { icon: 'elevator', label: 'مصعد' },
         { icon: 'security', label: 'أمن' }
      ],
      agent: {
        name: 'فاطمة السيد',
        phone: '01098765432',
        avatar: '/hijab_fatima.png',
        title: 'وكيل عقاري'
      },
      createdAt: '2026-01-19',
      tag: 'مميز',
      refCode: 'SKN-102',
      aiAnalysis: { status: 'high', percentage: 85, label: 'سعر مرتفع قليلاً' },
      mapPosition: { top: '55%', left: '70%' }
    },
    {
      id: 3,
      title: 'تاون هاوس في الشيخ زايد',
      price: '3,200,000',
      priceValue: 3200000,
      address: 'الشيخ زايد',
      city: 'الجيزة',
      beds: 4,
      baths: 3,
      area: '280 م²',
      areaValue: 280,
      type: 'sale',
      propertyType: 'house',
      images: [
        'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1605146769289-440113cc3d00?q=80&w=1000&auto=format&fit=crop'
      ],
      description: 'تاون هاوس متميز بالقرب من الخدمات والمولات التجارية في الشيخ زايد.',
      features: ['جراج خاص', 'أمن 24 ساعة', 'نادي صحي'],
      agent: {
        name: 'يوسف علي',
        phone: '01122334455',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
        title: 'خبير عقاري'
      },
      createdAt: '2026-01-18',
      tag: 'جديد',
      refCode: 'SKN-103',
      aiAnalysis: { status: 'low', percentage: 30, label: 'سعر لقطة' },
      mapPosition: { top: '60%', left: '20%' }
    },
    {
      id: 4,
      title: 'شاليه في الساحل الشمالي',
      price: '2,800,000',
      priceValue: 2800000,
      address: 'الساحل الشمالي',
      city: 'مرسى مطروح',
      beds: 2,
      baths: 1,
      area: '120 م²',
      areaValue: 120,
      type: 'sale',
      propertyType: 'chalet',
      images: [
        'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1471922694854-ff1b63b20054?q=80&w=1000&auto=format&fit=crop'
      ],
      description: 'شاليه صف أول على البحر مباشرة في أرقى قرى الساحل الشمالي.',
      features: ['شاطئ خاص', 'حمام سباحة', 'تشطيب كامل'],
      amenities: [
        { icon: 'pool', label: 'حمام سباحة' },
        { icon: 'beach_access', label: 'شاطئ خاص' }
      ],
      agent: {
        name: 'نور حسن',
        phone: '01233445566',
        avatar: '/hijab_noor.png',
        title: 'وكيل عقاري'
      },
      createdAt: '2026-01-15',
      tag: 'فرصة',
      refCode: 'SKN-104',
      aiAnalysis: { status: 'fair', percentage: 55, label: 'سعر عادل' },
      mapPosition: { top: '80%', left: '80%' }
    },
    // More properties from Details Mock
    {
      id: 5,
      title: 'دوبلكس واسع في المعادي',
      price: '4,900,000',
      priceValue: 4900000,
      address: 'المعادي',
      city: 'القاهرة',
      beds: 4,
      baths: 3,
      area: '220 م²',
      areaValue: 220,
      type: 'sale',
      propertyType: 'duplex',
      images: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000&auto=format&fit=crop'
      ],
      description: 'دوبلكس رائع بحديقة خاصة في أرقى مناطق المعادي...',
      features: ['حديقة خاصة', 'موقف خاص'],
      amenities: [
         { icon: 'local_parking', label: 'موقف خاص' },
         { icon: 'pool', label: 'حمام سباحة' }
      ],
      agent: {
        name: 'محمد خالد',
        phone: '01122334455',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDAEvAqDcy8oAuQZdaEghanv3aDQYp_AQihW1RQB3wc095q2sgxhpnwIVAY-P2Po-xqob-cm_9eloGQtkq7RiYX4ledolQci9ar5A-AJdRd7xUpcqIS9pSVpLEJCFiYOZ_B0qE9pmTVh1sSDx8xqxnKPxG1lXu2XVtCtALVRXrmBJf70FQTD9P4tQq9OdQKLXzwcuH-xJhCT4jEJvN3Sg9-dP1h9nJgoxbvc-1o8sM60L4dEbwLR8ILnAlZeO2RdyfSJLOGv0YNvk',
        title: 'وسيط تجاري'
      },
      createdAt: '2026-01-10',
      refCode: 'SKN-105',
      floor: 'الثالث'
    },
    {
      id: 6,
      title: 'بنتهاوس مع رووف في الشيخ زايد',
      price: '8,750,000',
      priceValue: 8750000,
      address: 'الشيخ زايد',
      city: 'الجيزة',
      beds: 3,
      baths: 3,
      area: '300 م²',
      areaValue: 300,
      type: 'sale',
      propertyType: 'penthouse',
      images: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600607687644-c7171b42498b?q=80&w=1000&auto=format&fit=crop'
      ],
      description: 'بنتهاوس بإطلالة بانورامية على المدينة مع رووف خاص وتجهيزات فاخرة.',
      features: ['رووف خاص', 'إطلالة بانورامية'],
      amenities: [{ icon: 'deck', label: 'رووف خاص' }],
      agent: {
        name: 'آية محمد',
        phone: '01223456789',
        avatar: '/hijab_aya.png',
        title: 'خبير عقاري'
      },
      createdAt: '2026-01-08',
      refCode: 'SKN-106',
      floor: 'الرابع'
    }
  ]);

  // Read-only signal
  properties = computed(() => this.propertiesSignal());

  // Get property by ID
  getPropertyById(id: number): Property | undefined {
    return this.propertiesSignal().find(p => p.id === id);
  }
  
  // Featured Properties
  getFeaturedProperties(): Property[] {
    return this.propertiesSignal().filter(p => !!p.tag);
  }

  // Search
  searchProperties(query: string): Property[] {
    const q = query.toLowerCase();
    return this.propertiesSignal().filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q)
    );
  }

  // Filter by Type
  getByType(type: 'sale' | 'rent'): Property[] {
    return this.propertiesSignal().filter(p => p.type === type);
  }
}
