import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-property-details',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './property-details.component.html',
  styleUrl: './property-details.component.scss'
})
export class PropertyDetailsComponent implements OnInit {
  private toast = inject(ToastService);
  private titleService = inject(Title);
  private route = inject(ActivatedRoute);

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
        'https://images.unsplash.com/photo-1600596542815-e32cb51813b9?q=80&w=1000&auto=format&fit=crop',
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
        'https://images.unsplash.com/photo-1512915990742-6651ac3579be?q=80&w=1000&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
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
    // البحث في قاعدة البيانات الوهمية
    const foundProperty = this.mockProperties.find(p => p.id === id);
    
    if (foundProperty) {
      this.property = foundProperty;
    } else {
      // لو الايدي مش موجود، ارجع للأول (fallback)
      this.property = this.mockProperties[0];
    }

    // تحديث الحالة
    this.titleService.setTitle(`${this.property.title} - Baytology`);
    this.activeImage.set(this.property.images[0]);
    this.mortgagePrice.set(this.property.price); // تحديث سعر الحاسبة
    this.isReported.set(false); // إعادة تعيين زر الإبلاغ
    
    // تحديث العقارات المشابهة (استبعاد الحالي)
    this.displayedSimilarProperties = this.mockProperties.filter(p => p.id !== this.property.id);
    
    // الصعود للأعلى
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    if (method === 'call') {
      window.open(`tel:${this.agent.phone}`, '_self');
    } else {
      const msg = `مرحباً، أستفسر عن العقار: ${this.property.title} (كود: ${this.property.refCode})`;
      const url = `https://wa.me/${this.agent.phone}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
    }
  }

  shareProperty() {
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
    window.print();
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