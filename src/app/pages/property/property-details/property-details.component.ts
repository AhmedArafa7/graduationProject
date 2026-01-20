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
  private locationMap: L.Map | null = null;


  // --- UI States ---
  isDescriptionExpanded = signal(false);
  isAiModalOpen = signal(false);
  isReported = signal(false); // حالة زر الإبلاغ
  activeImage = signal(''); 

  // --- Mock Database (قاعدة بيانات وهمية للتنقل) ---
  private mockProperties = [
    {
      id: 1,
      title: 'شقة مودرن بإطلالة على النيل',
      location: 'الزمالك، القاهرة',
      type: 'بيع',
      refCode: 'SKN-84521',
      price: 5250000,
      area: 185,
      beds: 3,
      baths: 2,
      floor: 'السابع',
      description: `اكتشف حياة الرفاهية في هذه الشقة المذهلة كاملة التشطيب في قلب الزمالك...`,
      amenities: [
        { icon: 'local_parking', label: 'موقف خاص' },
        { icon: 'balcony', label: 'شرفة' },
        { icon: 'security', label: 'أمن 24/7' },
        { icon: 'elevator', label: 'مصعد' },
        { icon: 'pets', label: 'يسمح بالحيوانات' },
        { icon: 'air', label: 'تكييف مركزي' },
        { icon: 'view_stream', label: 'إطلالة نيلية' },
        { icon: 'kitchen', label: 'مطبخ مجهز' },
      ],
      images: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1000&auto=format&fit=crop'
      ]
    },
    {
      id: 2,
      title: 'دوبلكس واسع في المعادي',
      location: 'المعادي، القاهرة',
      price: 4900000,
      type: 'بيع',
      refCode: 'SKN-99210',
      area: 220,
      beds: 4,
      baths: 3,
      floor: 'الثالث',
      description: 'دوبلكس رائع بحديقة خاصة في أرقى مناطق المعادي...',
      amenities: [
         { icon: 'local_parking', label: 'موقف خاص' },
         { icon: 'pool', label: 'حمام سباحة' }
      ],
      images: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000&auto=format&fit=crop'
      ]
    },
    {
      id: 3,
      title: 'فيلا فاخرة في التجمع',
      location: 'القاهرة الجديدة',
      price: 15500000,
      type: 'بيع',
      refCode: 'SKN-77412',
      area: 450,
      beds: 5,
      baths: 6,
      floor: 'أرضي + أول',
      description: 'فيلا مستقلة بتشطيب الترا لوكس وحمام سباحة...',
      amenities: [{ icon: 'pool', label: 'حمام سباحة' }],
      images: [
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?q=80&w=1000&auto=format&fit=crop'
      ]
    },
    {
      id: 4,
      title: 'بنتهاوس مع رووف',
      location: 'الشيخ زايد',
      price: 8750000,
      type: 'بيع',
      refCode: 'SKN-33211',
      area: 300,
      beds: 3,
      baths: 3,
      floor: 'الرابع',
      description: 'بنتهاوس بإطلالة بانورامية على المدينة...',
      amenities: [{ icon: 'deck', label: 'رووف خاص' }],
      images: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600607687644-c7171b42498b?q=80&w=1000&auto=format&fit=crop'
      ]
    }
  ];

  // الكائن الحالي المعروض (يتم تحديثه ديناميكياً)
  property: any = this.mockProperties[0];

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
  agent = {
    id: 1,
    name: 'فاطمة السيد',
    title: 'استشاري عقاري أول',
    image: '/hijab_fatima.png',
    experience: '5+',
    deals: 82,
    rating: 4.9,
    phone: '+201000000000'
  };

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
        ]
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
            : [agentProperty.image]
        };
      } else {
        // 1. البحث في PropertyService (العقارات المشتركة)
        const serviceProperty = this.propertyService.getPropertyById(id);
        
        if (serviceProperty) {
          this.property = {
            id: serviceProperty.id,
            title: serviceProperty.title,
            location: `${serviceProperty.address}، ${serviceProperty.city}`,
            type: serviceProperty.type === 'sale' ? 'بيع' : 'إيجار',
            refCode: `BYT-${serviceProperty.id}`,
            price: serviceProperty.priceValue,
            area: serviceProperty.areaValue,
            beds: serviceProperty.beds,
            baths: serviceProperty.baths,
            floor: 'غير محدد',
            description: serviceProperty.description,
            amenities: serviceProperty.features.map(f => ({ icon: 'check_circle', label: f })),
            images: serviceProperty.images
          };
        } else {
          // 2. البحث في قاعدة البيانات الوهمية
          const foundProperty = this.mockProperties.find(p => p.id === id);
          
          if (foundProperty) {
            this.property = foundProperty;
          } else {
            // لو الايدي مش موجود، ارجع للأول (fallback)
            this.property = this.mockProperties[0];
          }
        }
      }
    }

    // تحديث الحالة
    this.titleService.setTitle(`${this.property.title} - Baytology`);
    this.activeImage.set(this.property.images[0]);
    this.mortgagePrice.set(this.property.price); // تحديث سعر الحاسبة
    this.isReported.set(false); // إعادة تعيين زر الإبلاغ
    
    // تحديث العقارات المشابهة (استبعاد الحالي)
    this.displayedSimilarProperties = this.mockProperties.filter(p => p.id !== this.property.id);
    
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
    if (!isPlatformBrowser(this.platformId)) return;
    
    if (method === 'call') {
      window.open(`tel:${this.agent.phone}`, '_self');
    } else {
      const msg = `مرحباً، أستفسر عن العقار: ${this.property.title} (كود: ${this.property.refCode})`;
      const url = `https://wa.me/${this.agent.phone}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
    }
  }

  // فتح محادثة مع الوكيل
  openChatWithAgent() {
    const conversationId = this.messagesService.startChatWithAgent(
      this.agent.name,
      this.agent.image,
      this.property.title
    );
    this.router.navigate(['/user/messages'], { queryParams: { chat: conversationId } });
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