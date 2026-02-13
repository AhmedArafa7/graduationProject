import { Component, signal, computed, inject, OnInit, PLATFORM_ID, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';
import { UserService } from '../../../core/services/user.service';
import { Title } from '@angular/platform-browser';
import { ChatbotService } from '../../../core/services/chatbot/chatbot.service';
import { ChatProperty } from '../../../core/models/chatbot.model';
import { PropertyService } from '../../../core/services/property.service';
import { Property } from '../../../core/models/property.model';
import { AgentPropertiesService } from '../../../core/services/agent-properties.service';
import { MessagesService } from '../../../core/services/messages.service';
import { RatingService } from '../../../core/services/rating.service';
import { ReportService } from '../../../core/services/report.service';
// import * as L from 'leaflet'; // Removed static import


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
  private userService = inject(UserService);
  private ratingService = inject(RatingService);
  private reportService = inject(ReportService);
  
  private locationMap: any | null = null; // Changed to any
  private L: any = null; // Leaflet module


  // --- UI States ---
  isDescriptionExpanded = signal(false);
  isAiModalOpen = signal(false);
  isReported = signal(false); // حالة زر الإبلاغ
  activeImage = signal(''); 

  // --- Rating & Reviews ---
  propertyReviews = computed(() => this.ratingService.getReviews(this.property?.id, 'property')());
  propertyRating = computed(() => this.ratingService.getAverageRating(this.property?.id, 'property')());
  reviewsCount = computed(() => this.ratingService.getReviewsCount(this.property?.id, 'property')());
  
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
  property: Property | undefined; // Will be initialized in loadProperty

  // --- Mortgage Calculator ---
  mortgagePrice = signal(0);
  
  marketValueLow = computed(() => (this.property?.price || 0) * 0.95);
  marketValueHigh = computed(() => (this.property?.price || 0) * 1.05);

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
      const id = params['id']; // ID is string now
      this.loadProperty(id);
    });
  }

  loadProperty(id: string) {
    // فحص إذا كان هناك عقار مختار من الشات بوت
    const chatProperty = this.chatbotService.selectedChatProperty();
    
    if (chatProperty) {
      // عرض بيانات العقار من الشات بوت
      this.property = {
        id: chatProperty.id?.toString() || id,
        title: `${chatProperty.type || 'عقار'} في ${chatProperty.city || ''}`,
        location: chatProperty.city || 'غير محدد',
        type: chatProperty.payment_option === 'rent' ? 'rent' : 'sale',
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
           name: 'System Agent', phone: '123456', avatar: '/assets/images/logo.png', title: 'AI Assistant', experience: '5', deals: 50, rating: 4.8
        }
      };
      this.chatbotService.clearSelectedChatProperty();
      this.updateUI();
      return;
    }

    // 1. Try AgentPropertiesService (Async)
    this.agentPropertiesService.getPropertyById(id).subscribe({
      next: (agentProperty) => {
        if (agentProperty) {
          // تحويل بيانات AgentProperty لصيغة هذا الـ componentViewModel
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
            type: agentProperty.status === 'للإيجار' ? 'rent' : 'sale',
            refCode: `AGT-${agentProperty.id}`,
            price: agentProperty.priceValue ?? 0,
            area: agentProperty.area ?? 0,
            beds: agentProperty.bedrooms ?? 0,
            baths: agentProperty.bathrooms ?? 0,
            floor: agentProperty.floor !== undefined && agentProperty.floor !== null ? `الطابق ${agentProperty.floor}` : 'غير محدد',
            description: agentProperty.description || 'لا يوجد وصف',
            amenities: amenitiesList.length > 0 ? amenitiesList : [{ icon: 'home', label: 'عقار سكني' }],
            images: agentProperty.images && agentProperty.images.length > 0 ? agentProperty.images : [agentProperty.image],
            agent: {
               name: 'الوكيل الحالي', phone: '', avatar: '/assets/images/user-placeholder.png', title: 'مالك العقار', experience: '2', deals: 10, rating: 4.5
            }
          };
          this.updateUI();
        }
      },
      error: () => {
        // 2. البحث في PropertyService (Consolidated Source) كـ fallback
        // NEW: PropertyService now returns Observable
        this.propertyService.getPropertyById(id).subscribe({
          next: (serviceProperty) => {
            if (serviceProperty) {
              this.property = {
                id: serviceProperty._id,
                title: serviceProperty.title,
                location: `${serviceProperty.location.address}، ${serviceProperty.location.city}`,
                type: serviceProperty.type === 'sale' ? 'sale' : 'rent',
                refCode: serviceProperty.refCode || `BYT-${serviceProperty._id.substring(0,6)}`,
                price: serviceProperty.price,
                area: serviceProperty.area,
                beds: serviceProperty.bedrooms,
                baths: serviceProperty.bathrooms,
                floor: serviceProperty.floor || 'غير محدد',
                description: serviceProperty.description,
                amenities: serviceProperty.amenities || serviceProperty.features.map(f => ({ icon: 'check_circle', label: f })),
                images: serviceProperty.images,
                agent: serviceProperty.agent
              };
              this.updateUI();
            } else {
               // Fallback if ID not found, load first one (Safeguard)
               // Note: This relies on properties() being loaded, which might not be true if we came here directly.
               // Ideally we should show a 404.
               console.warn('Property not found in service');
            }
          },
          error: (err) => {
             console.error('Failed to load property details', err);
             this.toast.show('تعذر تحميل تفاصيل العقار', 'error');
          }
        });
      }
    });
  }

  updateUI() {
    if (this.property) {
      this.titleService.setTitle(`${this.property.title} - Baytology`);
      this.activeImage.set(this.property.images[0]);
      this.mortgagePrice.set(this.property.price);
      this.isReported.set(false);
      
      const allProps = this.propertyService.properties();
      this.displayedSimilarProperties = allProps
        .filter(p => p._id !== this.property.id)
        .slice(0, 3)
        .map(p => ({
            id: p._id,
            title: p.title,
            price: p.price,
            location: `${p.location.city}`,
            images: p.images,
            beds: p.bedrooms,
            baths: p.bathrooms,
            area: p.area
        }));
        
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => this.initLocationMap(), 500);
      }
    }
  }

  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        this.L = await import('leaflet');
        // If property is already loaded, init map (wait for DOM)
        if (this.property) {
             setTimeout(() => this.initLocationMap(), 100);
        }
      } catch (error) {
        console.error('Failed to load Leaflet', error);
      }
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
    if (!isPlatformBrowser(this.platformId) || !this.L) return;
    
    const mapElement = document.getElementById('property-location-map');
    if (!mapElement) return;

    // إزالة الخريطة القديمة
    if (this.locationMap) {
      this.locationMap.remove();
      this.locationMap = null;
    }

    // البحث عن الإحداثيات
    let coords: [number, number] = [30.0444, 31.2357]; // القاهرة افتراضياً
    const locationStr = typeof this.property?.location === 'string' ? this.property.location : (this.property?.location?.city || '');
    
    for (const [area, coord] of Object.entries(this.locationCoords)) {
      if (locationStr.includes(area)) {
        coords = coord;
        break;
      }
    }

    // إنشاء الخريطة
    this.locationMap = this.L.map('property-location-map').setView(coords, 14);

    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.locationMap);

    // إصلاح مشكلة أيقونة الـ marker
    const customIcon = this.L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // إضافة marker
    this.L.marker(coords, { icon: customIcon }).addTo(this.locationMap)
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

    // Prefer agent ID from backend object, fallback to mock logic if needed
    const agentId = (this.property.agent as any)._id || (this.property.agent as any).id || 'system';

    this.messagesService.startChatWithAgent(
      this.property.agent.name,
      this.property.agent.avatar || '',
      agentId
    ).subscribe({
      next: (conversationId) => {
        this.router.navigate(['/messages'], { queryParams: { chat: conversationId } });
      },
      error: (err) => {
        this.toast.show('يجب تسجيل الدخول لبدء المحادثة', 'error');
        console.error(err);
      }
    });
  }

  shareProperty() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    if (navigator.share) {
      navigator.share({
        title: this.property?.title || '',
        text: `شاهد هذا العقار المميز على Baytology: ${this.property?.title || ''}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href)
        .then(() => {
          this.toast.show('تم نسخ رابط العقار للحافظة', 'success');
        })
        .catch(() => {
          this.toast.show('فشل نسخ الرابط', 'error');
        });
    }
  }

  printPage() {
    if (isPlatformBrowser(this.platformId)) {
      window.print();
    }
  }

  // منطق زر الإبلاغ

  // --- Report Modal Logic ---
  isReportModalOpen = signal(false);

  toggleReport() {
    const user = this.userService.userData();
    if (!user._id) {
      this.toast.show('يجب عليك تسجيل الدخول للإبلاغ عن عقار', 'error');
      return;
    }

    if (this.isReported()) {
      this.toast.show('سبق لك الإبلاغ عن هذا العقار.', 'info');
      return;
    }

    this.isReportModalOpen.set(true);
  }

  closeReportModal() {
    this.isReportModalOpen.set(false);
  }

  submitReport(reason: string, details: string) {
    const user = this.userService.userData();
    if (!user._id || !this.property) return;

    const fullReason = `${reason}: ${details}`;
    
    this.reportService.reportProperty(this.property.id || this.property._id || '', user._id, fullReason).subscribe({
      next: () => {
        this.isReported.set(true);
        this.closeReportModal();
        this.toast.show('تم استلام بلاغك وسيقوم فريقنا بمراجعته.', 'success');
      },
      error: (err) => {
        console.error(err);
        this.toast.show('حدث خطأ أثناء إرسال البلاغ.', 'error');
      }
    });
  }

}