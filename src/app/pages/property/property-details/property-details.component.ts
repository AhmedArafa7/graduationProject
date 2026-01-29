import { Component, signal, computed, inject, OnInit, PLATFORM_ID, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';
import { Title } from '@angular/platform-browser';
import { ChatbotService, Property as ChatProperty } from '../../../core/services/chatbot/chatbot.service';
import { PropertyService } from '../../../core/services/property.service';
import { AgentPropertiesService } from '../../../core/services/agent-properties.service';
import { MessagesService } from '../../../core/services/messages.service';
import { RatingService } from '../../../core/services/rating.service';
import * as L from 'leaflet';


@Component({
  selector: 'app-property-details',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './property-details.component.html',
  styleUrl: './property-details.component.scss'
})
export class PropertyDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  private toast = inject(ToastService);
  private titleService = inject(Title);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private chatbotService = inject(ChatbotService);
  private propertyService = inject(PropertyService);
  private agentPropertiesService = inject(AgentPropertiesService);
  private messagesService = inject(MessagesService);
  private ratingService = inject(RatingService);
  private locationMap: L.Map | null = null;


  // --- UI States ---
  isDescriptionExpanded = signal(false);
  isAiModalOpen = signal(false);
  isReported = signal(false); // حالة زر الإبلاغ
  activeImage = signal(''); 

  // --- Rating & Reviews ---
  propertyReviews = computed(() => this.ratingService.getReviews(this.property.id, 'property')());
  propertyRating = computed(() => this.ratingService.getAverageRating(this.property.id, 'property')());
  reviewsCount = computed(() => this.ratingService.getReviewsCount(this.property.id, 'property')());
  
  ratingDistribution = computed(() => {
    const reviews = this.propertyReviews();
    const total = reviews.length;
    if (total === 0) return [5, 4, 3, 2, 1].map(stars => ({ stars, percentage: 0 }));
    
    return [5, 4, 3, 2, 1].map(stars => ({
      stars,
      percentage: Math.round((reviews.filter(r => Math.round(r.rating) === stars).length / total) * 100)
    }));
  });

  // --- New Review Form ---
  newReview = {
    rating: signal(5),
    text: signal(''),
    isSubmitting: signal(false)
  };

  submitReview() {
    if (!this.newReview.text()) {
      this.toast.show('يرجى كتابة تعليقك', 'error');
      return;
    }

    this.newReview.isSubmitting.set(true);
    
    // Simulate API delay
    setTimeout(() => {
      this.ratingService.addReview(
        this.property.id,
        'property',
        this.newReview.rating(),
        this.newReview.text(),
        'أنت (زائر)',
        '/assets/images/user-placeholder.png'
      );
      
      this.toast.show('تم إضافة تقييمك بنجاح!', 'success');
      this.newReview.text.set('');
      this.newReview.rating.set(5);
      this.newReview.isSubmitting.set(false);
    }, 800);
  } 

  // الكائن الحالي المعروض (يتم تحديثه ديناميكياً)
  property: any; // Will be initialized in loadProperty

  // --- Mortgage Calculator ---
  mortgagePrice = signal(0);
  downPaymentPercent = signal(20);
  loanTerm = signal(15);
  interestRate = signal(8.5);

  monthlyPayment = computed(() => {
    const principal = this.mortgagePrice() * (1 - this.downPaymentPercent() / 100);
    const monthlyRate = this.interestRate() / 100 / 12;
    const numberOfPayments = this.loanTerm() * 12;
    if (monthlyRate === 0) return principal / numberOfPayments;
    const x = Math.pow(1 + monthlyRate, numberOfPayments);
    return (principal * x * monthlyRate) / (x - 1);
  });

  totalPaid = computed(() => {
    return (this.monthlyPayment() * this.loanTerm() * 12) + (this.mortgagePrice() * (this.downPaymentPercent() / 100));
  });

  // --- Agent & Similar ---
  // Agent will be loaded from property data
  
  // نحتاج لعرض باقي العقارات في قسم "مشابهة" باستثناء العقار الحالي
  displayedSimilarProperties: any[] = [];

  // --- Booking Form ---
  booking = {
    date: signal(''),
    time: signal(''),
    note: signal('')
  };

  ngOnInit() {
    // مراقبة تغيير الرابط (عند الضغط على عقار مشابه)
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      this.loadProperty(id);
    });
  }

  loadProperty(id: number) {
    // فحص إذا كان هناك عقار مختار من الشات بوت
    const chatProperty = this.chatbotService.selectedProperty();
    
    if (chatProperty) {
      // عرض بيانات العقار من الشات بوت
      this.property = {
        id: chatProperty.id || id,
        title: `${chatProperty.type || 'عقار'} في ${chatProperty.city || ''}`,
        location: chatProperty.city || 'غير محدد',
        type: chatProperty.payment_option === 'rent' ? 'إيجار' : 'بيع',
        refCode: `API-${chatProperty.id || id}`,
        price: chatProperty.price || 0,
        area: chatProperty.size_sqm || 0,
        beds: chatProperty.bedrooms || 0,
        baths: chatProperty.bathrooms || 0,
        floor: chatProperty.floor || 'غير محدد',
        description: `${chatProperty.type || 'عقار'} مميز في ${chatProperty.city || ''} بمساحة ${chatProperty.size_sqm || 0} متر مربع. يحتوي على ${chatProperty.bedrooms || 0} غرف نوم و ${chatProperty.bathrooms || 0} حمام. ${chatProperty.furnished === 'yes' ? 'مفروش بالكامل.' : ''}`,
        amenities: [
          { icon: 'home', label: chatProperty.type || 'عقار' },
          { icon: 'location_city', label: chatProperty.city || 'غير محدد' },
          ...(chatProperty.furnished === 'yes' ? [{ icon: 'chair', label: 'مفروش' }] : [])
        ],
        images: [
          (chatProperty as any).displayImage || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1000&auto=format&fit=crop'
        ],
        agent: {
           name: 'System Agent', phone: '123456', avatar: '/assets/images/logo.png', title: 'AI Assistant'
        }
      };
      // مسح العقار المختار بعد العرض
      this.chatbotService.clearSelectedProperty();
    } else {
      // 0. البحث في AgentPropertiesService أولاً (العقارات المضافة من الوكيل)
      const agentProperty = this.agentPropertiesService.getPropertyById(id);
      
      if (agentProperty) {
        // تحويل بيانات AgentProperty لصيغة هذا الـ component
        const amenitiesList: { icon: string; label: string }[] = [];
        if (agentProperty.amenities) {
          if (agentProperty.amenities.pool) amenitiesList.push({ icon: 'pool', label: 'مسبح' });
          if (agentProperty.amenities.garage) amenitiesList.push({ icon: 'local_parking', label: 'جراج' });
          if (agentProperty.amenities.gym) amenitiesList.push({ icon: 'fitness_center', label: 'صالة رياضية' });
          if (agentProperty.amenities.garden) amenitiesList.push({ icon: 'park', label: 'حديقة' });
          if (agentProperty.amenities.balcony) amenitiesList.push({ icon: 'balcony', label: 'بلكونة' });
          if (agentProperty.amenities.security) amenitiesList.push({ icon: 'security', label: 'أمن 24/7' });
          if (agentProperty.amenities.ac) amenitiesList.push({ icon: 'air', label: 'تكييف' });
          if (agentProperty.amenities.petFriendly) amenitiesList.push({ icon: 'pets', label: 'يسمح بالحيوانات' });
        }
        
        this.property = {
          id: agentProperty.id,
          title: agentProperty.address,
          location: agentProperty.address,
          type: agentProperty.status === 'للإيجار' ? 'إيجار' : 'بيع',
          refCode: `AGT-${agentProperty.id}`,
          price: agentProperty.priceValue ?? null,
          area: agentProperty.area ?? null,
          beds: agentProperty.bedrooms ?? null,
          baths: agentProperty.bathrooms ?? null,
          floor: agentProperty.floor !== undefined && agentProperty.floor !== null ? `الطابق ${agentProperty.floor}` : 'غير محدد',
          description: agentProperty.description || 'لا يوجد وصف',
          amenities: amenitiesList.length > 0 ? amenitiesList : [{ icon: 'home', label: 'عقار سكني' }],
          images: agentProperty.images && agentProperty.images.length > 0 
            ? agentProperty.images 
            : [agentProperty.image],
          agent: {
             name: 'الوكيل الحالي', phone: '', avatar: '/assets/images/user-placeholder.png', title: 'مالك العقار'
          }
        };
      } else {
        // 1. البحث في PropertyService (Consolidated Source)
        const serviceProperty = this.propertyService.getPropertyById(id);
        
        if (serviceProperty) {
          this.property = {
            id: serviceProperty.id,
            title: serviceProperty.title,
            location: `${serviceProperty.address}، ${serviceProperty.city}`,
            type: serviceProperty.type === 'sale' ? 'بيع' : 'إيجار',
            refCode: serviceProperty.refCode || `BYT-${serviceProperty.id}`,
            price: serviceProperty.priceValue,
            area: serviceProperty.areaValue,
            beds: serviceProperty.beds,
            baths: serviceProperty.baths,
            floor: serviceProperty.floor || 'غير محدد',
            description: serviceProperty.description,
            amenities: serviceProperty.amenities || serviceProperty.features.map(f => ({ icon: 'check_circle', label: f })),
            images: serviceProperty.images,
            agent: serviceProperty.agent
          };
        } else {
           // Fallback if ID not found, load first one (Safeguard)
           const first = this.propertyService.properties()[0];
           if (first) {
             this.loadProperty(first.id); // Recursively load first
             return;
           }
        }
      }
    }

    // تحديث الحالة
    this.titleService.setTitle(`${this.property.title} - Baytology`);
    this.activeImage.set(this.property.images[0]);
    this.mortgagePrice.set(this.property.price); // تحديث سعر الحاسبة
    this.isReported.set(false); // إعادة تعيين زر الإبلاغ
    
    // تحديث العقارات المشابهة (استبعاد الحالي البحث في الخدمة)
    const allProps = this.propertyService.properties();
    // Simple similarity: same city or random others
    this.displayedSimilarProperties = allProps.filter(p => p.id !== this.property.id).slice(0, 3);
    
    // الصعود للأعلى
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // تحديث الخريطة بعد فترة قصيرة
      setTimeout(() => this.initLocationMap(), 300);
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.initLocationMap(), 500);
    }
  }

  ngOnDestroy() {
    if (this.locationMap) {
      this.locationMap.remove();
      this.locationMap = null;
    }
  }

  // خريطة إحداثيات المناطق
  private locationCoords: { [key: string]: [number, number] } = {
    'الزمالك': [30.0609, 31.2193],
    'المعادي': [29.9604, 31.2577],
    'التجمع الخامس': [30.0131, 31.4306],
    'الشيخ زايد': [30.0174, 30.9728],
    'القاهرة الجديدة': [30.0289, 31.4523],
    'وسط البلد': [30.0444, 31.2357],
    'مصر الجديدة': [30.0912, 31.3260],
    'المهندسين': [30.0571, 31.2073],
    'الدقي': [30.0392, 31.2125],
    '6 أكتوبر': [29.9772, 30.9345],
    'العاصمة الإدارية': [30.0171, 31.7500]
  };

  private initLocationMap() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const mapElement = document.getElementById('property-location-map');
    if (!mapElement) return;

    // إزالة الخريطة القديمة
    if (this.locationMap) {
      this.locationMap.remove();
      this.locationMap = null;
    }

    // البحث عن الإحداثيات
    let coords: [number, number] = [30.0444, 31.2357]; // القاهرة افتراضياً
    const location = this.property?.location || '';
    
    for (const [area, coord] of Object.entries(this.locationCoords)) {
      if (location.includes(area)) {
        coords = coord;
        break;
      }
    }

    // إنشاء الخريطة
    this.locationMap = L.map('property-location-map').setView(coords, 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.locationMap);

    // إصلاح مشكلة أيقونة الـ marker
    const customIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // إضافة marker
    L.marker(coords, { icon: customIcon }).addTo(this.locationMap)
      .bindPopup(`<b>${this.property?.title || 'الموقع'}</b><br>${location}`)
      .openPopup();
  }

  // --- Actions ---

  setActiveImage(imgUrl: string) {
    this.activeImage.set(imgUrl);
  }

  toggleDescription() {
    this.isDescriptionExpanded.update(v => !v);
  }

  openAiModal() {
    this.isAiModalOpen.set(true);
  }

  closeAiModal() {
    this.isAiModalOpen.set(false);
  }

  startVirtualTour() {
    this.toast.show('جاري تحميل الجولة الافتراضية 360 درجة...', 'info');
  }

  submitBooking() {
    if (!this.booking.date() || !this.booking.time()) {
      this.toast.show('يرجى تحديد التاريخ والوقت للمعاينة', 'error');
      return;
    }
    this.toast.show('تم استلام طلب المعاينة! سيتواصل معك الوكيل للتأكيد.', 'success');
    this.booking.date.set('');
    this.booking.time.set('');
    this.booking.note.set('');
  }

  contactAgent(method: 'call' | 'whatsapp') {
    if (!isPlatformBrowser(this.platformId) || !this.property.agent) return;
    
    if (method === 'call') {
      window.open(`tel:${this.property.agent.phone}`, '_self');
    } else {
      const msg = `مرحباً، أستفسر عن العقار: ${this.property.title} (كود: ${this.property.refCode})`;
      const url = `https://wa.me/${this.property.agent.phone}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
    }
  }

  // فتح محادثة مع الوكيل
  openChatWithAgent() {
    if (!this.property.agent) return;

    const conversationId = this.messagesService.startChatWithAgent(
      this.property.agent.name,
      this.property.agent.avatar,
      this.property.title
    );
    this.router.navigate(['/messages'], { queryParams: { chat: conversationId } });
  }

  shareProperty() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    if (navigator.share) {
      navigator.share({
        title: this.property.title,
        text: `شاهد هذا العقار المميز على Baytology: ${this.property.title}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      this.toast.show('تم نسخ رابط العقار للحافظة', 'success');
    }
  }

  printPage() {
    if (isPlatformBrowser(this.platformId)) {
      window.print();
    }
  }

  // منطق زر الإبلاغ الجديد
  toggleReport() {
    this.isReported.update(v => !v);
    
    if (this.isReported()) {
      this.toast.show('تم إرسال البلاغ للمراجعة.', 'error');
    } else {
      this.toast.show('تم إلغاء الإبلاغ. لن يتم اتخاذ أي إجراء.', 'info');
    }
  }
}