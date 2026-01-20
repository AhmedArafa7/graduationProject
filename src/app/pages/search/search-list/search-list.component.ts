import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GlobalStateService, SearchFilters } from '../../../core/services/global-state.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-search-list',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './search-list.component.html',
  styleUrl: './search-list.component.scss'
})
export class SearchListComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  public globalState = inject(GlobalStateService);
  private toast = inject(ToastService);

  viewMode = signal<'grid' | 'list'>('grid');
  currentPage = signal(1);
  isLoading = signal(false);

  // Local Filters
  localFilters: SearchFilters;

  constructor() {
    // تحميل الفلاتر من الذاكرة العامة
    this.localFilters = { ...this.globalState.searchFilters() };

    this.route.queryParams.subscribe(params => {
      if (params['type']) {
        this.localFilters.type = params['type'] === 'buy' ? 'شقة' : 'فيلا';
        this.applyFilters();
      }
    });
  }

  setView(mode: 'grid' | 'list') {
    this.viewMode.set(mode);
  }

  toggleFavorite(event: Event, id: number) {
    event.stopPropagation();
    event.preventDefault();
    this.globalState.toggleFavorite(id);
    const action = this.globalState.isFavorite(id) ? 'إضافة إلى' : 'إزالة من';
    this.toast.show(`تم ${action} المفضلة`, 'info');
  }

  saveSearch() {
    this.toast.show('تم حفظ البحث بنجاح! سنرسل لك تنبيهات للعقارات الجديدة.', 'success');
  }

  applyFilters() {
    this.isLoading.set(true);
    setTimeout(() => {
      this.globalState.updateFilters(this.localFilters);
      this.isLoading.set(false);
      this.toast.show('تم تحديث نتائج البحث', 'success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 600);
  }

  resetFilters() {
    this.globalState.resetFilters();
    this.localFilters = { ...this.globalState.searchFilters() };
    this.toast.show('تم إعادة تعيين الفلاتر', 'info');
  }

  // --- دالة جديدة لحذف الفلاتر عند الضغط على X ---
  removeFilter(filterKey: string) {
    const current = this.globalState.searchFilters();
    const updatedFilters = { ...current };

    // منطق الحذف حسب نوع الفلتر
    if (filterKey === 'type') {
      updatedFilters.type = 'شقة'; // العودة للافتراضي
    } else if (filterKey === 'pool') {
      updatedFilters.amenities = { ...current.amenities, pool: false };
    } else if (filterKey === 'garden') {
      updatedFilters.amenities = { ...current.amenities, garden: false };
    }
    // يمكنك إضافة باقي الحالات هنا (جراج، شرفة، إلخ)

    // 1. تحديث الحالة العامة
    this.globalState.updateFilters(updatedFilters);
    
    // 2. تحديث الفلاتر المحلية (عشان الـ Checkbox في السايدبار يتشال)
    this.localFilters = { ...updatedFilters };

    this.toast.show('تم إزالة الفلتر', 'info');
  }

  onPageChange(event: Event, page: number) {
    event.preventDefault();
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Data (Mock)
  properties = [
    {
      id: 1,
      title: 'فيلا حديثة بإطلالة على النيل',
      location: 'الزمالك، القاهرة',
      price: '15,000,000',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAA6ht3FvXHzptUVFlnFb2xyJ9_5EdAVtWpG-zs33R1rLLKlTGNOfb-K8i6AKmXUDPm2F2jBK99LkrY5Vh5jXhNfBpTk9STvu9lLrcMVmtXteXOBvcdSdaYHkqZqwEY431vxg2by8aLGiqtpXTTCUbFOnzb-7EW1eCmPR59FHD6vPjmfosD13KrsyMiFCHjxm0kXAaMu40Rt1IQCDNnRHlFIiu4Arz1Wu4F-dFvtSE68MxPJYLED99inARWhZVNj3DY3lT3rKDEmJU',
      beds: 4,
      baths: 5,
      area: 500,
      type: 'فيلا',
      tags: ['مميز', 'جديد'],
      agentType: 'وكيل عقاري',
      agentImage: '/hijab_fatima.png',
      mapPosition: { top: '40%', left: '60%' },
      aiAnalysis: { status: 'fair', percentage: 60, label: 'سعر عادل' }
    },
    // ... باقي البيانات كما هي
    {
      id: 2,
      title: 'شقة مريحة في وسط البلد',
      location: 'وسط البلد، القاهرة',
      price: '3,200,000',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYZW2y7Ohh_U4RJL1jVPg6L9_mzb-HRrsC03Sv_djSJtIi1-QcrnGxiUTlZ4AI9AUw7llEnLtJwoNNlzpnAmBqSLItA7m1GIHOJbfQTLEU99YPdlT4o-PJvJ6iqQkpWWoZRld4mHqsHNwWm7_AfhuHQWybK_ZIJlM_m2Rsiob2PNlPlaYJDkF2RzDUyT_eqOsVhdtsSiYxEFcK9Mh6TK062p87V7pBDzoNgi-uAu_Xsf0Xoe4GgjuQNaXb1vVlhqKyjUmOIxkS-DI',
      beds: 2,
      baths: 2,
      area: 150,
      type: 'شقة',
      tags: ['مقترح بالذكاء الاصطناعي'],
      agentType: 'المالك',
      agentImage: '/Ahmed_Arafa.jpg',
      mapPosition: { top: '55%', left: '70%' },
      aiAnalysis: { status: 'high', percentage: 85, label: 'سعر مرتفع قليلاً' }
    },
    {
      id: 3,
      title: 'تاون هاوس في الشيخ زايد',
      location: 'الشيخ زايد، الجيزة',
      price: '8,500,000',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-mZP3iqqtk8FxMuWVgdt8Dlt1u0_EY18NmT5D32pR6VEgOZ9F2LtjucJ4Am1bdRJzwwsBDPweWuO1GVJN6J81NIK36Lver20JcsB-R3chWlAevm2hLMA3xBcrU8Z-Hv71VttUrjKW_SErng4hzeTRDFZwxHcQREsg-hKfraWevQPd0M0coK8Y6GXWA53pBkCcveg4fKxHvJ4EwYuwFXIfJbRBor8r7_Y954Y4no1ess6Lol1mtkbeDvKqbef_NKst7Xe-5EwJml8',
      beds: 3,
      baths: 3,
      area: 280,
      type: 'تاون هاوس',
      tags: [],
      agentType: 'وكيل عقاري',
      agentImage: '/hijab_aya.png',
      mapPosition: { top: '60%', left: '20%' },
      aiAnalysis: { status: 'low', percentage: 30, label: 'سعر لقطة' }
    },
    {
      id: 4,
      title: 'شاليه في العين السخنة',
      location: 'العين السخنة',
      price: '4,100,000',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkW4pZoNmTD4XK2IkngG114JKQY718qSsH1Lmj68oMZ84veTH4wYyc8Wbo5FeA2RlOsSUiR2de2g2ZrlJIWrkTCIoD9z5mwIPgXTsWOn_xP9yhrbpIpP1u--k6-g_iIxV88BkcKOvgTr8BnDs68Si-sJs9_y1b_Mj8Aj1Y3xUYADSgOe1FscjwJhOWmfXWLgUtr_Gy8yu_hQu6RfP1IS57GE9s1lk96M-Juw30bbdjGmvLvdFCrnu95AsoQJKg5n2r61rOro_be2w',
      beds: 2,
      baths: 1,
      area: 110,
      type: 'شاليه',
      tags: ['استثمار جيد'],
      agentType: 'المالك',
      agentImage: '/Omar_Elpeltage.png',
      mapPosition: { top: '80%', left: '80%' },
      aiAnalysis: { status: 'fair', percentage: 55, label: 'سعر عادل' }
    }
  ];

  filteredProperties = computed(() => {
    const filters = this.globalState.searchFilters();
    return this.properties.filter(prop => {
      // Filter logic (Type)
      if (filters.type && filters.type !== 'شقة' && prop.type !== filters.type) return false;
      
      // Filter logic (Amenities - Mock example)
      // هنا مفروض نتأكد ان العقار فيه المرفق ده، بس عشان البيانات Mock هنفترض ان كله تمام
      // في الحقيقة هيكون: if (filters.amenities.pool && !prop.amenities.pool) return false;
      
      return true;
    });
  });
}