import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GlobalStateService, SearchFilters } from '../../../core/services/global-state.service';
import { ToastService } from '../../../core/services/toast.service';
import { PropertyService } from '../../../core/services/property.service';

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
  private propertyService = inject(PropertyService);

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
  // Data Source
  properties = this.propertyService.properties; // Use Signal from Service

  filteredProperties = computed(() => {
    const filters = this.globalState.searchFilters();
    const allProps = this.properties();
    
    return allProps.filter(prop => {
      // Filter logic (Type)
      // Service uses 'apartment', 'villa', etc. GlobalState uses 'شقة', 'فيلا'.
      // Need mapping or standardizing.
      // GlobalState seems to use Arabic labels 'شقة', 'فيلا'.
      // PropertyService uses 'apartment', 'villa' in propertyType, but also has distinct types?
      // Let's check logic:
      // filters.type is string.
      // prop.propertyType is 'apartment' | 'villa' ...
      
      if (filters.type) {
         const typeMap: {[key: string]: string} = {
           'شقة': 'apartment',
           'فيلا': 'villa',
           'تاون هاوس': 'house',
           'شاليه': 'chalet',
           'دوبلكس': 'duplex',
           'بنتهاوس': 'penthouse'
         };
         
         const mappedType = typeMap[filters.type];
         if (mappedType && prop.propertyType !== mappedType) return false;
      }

      // Filter logic (Amenities - Mock example)
      // Here we check provided amenities in Property model
      if (filters.amenities.pool && !prop.features.some(f => f.includes('مسبح') || f.includes('pool'))) return false;
      if (filters.amenities.garden && !prop.features.some(f => f.includes('حديقة') || f.includes('garden'))) return false;
      
      return true;
    });
  });
}