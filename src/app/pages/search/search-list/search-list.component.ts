import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GlobalStateService, SearchFilters } from '../../../core/services/global-state.service';
import { ToastService } from '../../../core/services/toast.service';
import { PropertyService } from '../../../core/services/property.service';
import { OfflineAiService } from '../../../core/services/offline-ai.service';

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
  private offlineAi = inject(OfflineAiService);

  viewMode = signal<'grid' | 'list'>('grid');
  currentPage = signal(1);
  isLoading = signal(false);
  
  // Smart Search
  smartSearchQuery = signal('');
  aiAnalysisResult = signal<string | null>(null);

  // Local Filters
  localFilters: SearchFilters;

  // Data Source
  properties = this.propertyService.properties; 

  constructor() {
    // تحميل الفلاتر من الذاكرة العامة
    this.localFilters = { ...this.globalState.searchFilters() };

    this.route.queryParams.subscribe(params => {
      // FIX: Do not force property type based on buy/rent param
      /*
      if (params['type']) {
        this.localFilters.type = params['type'] === 'buy' ? 'شقة' : 'فيلا';
        this.applyFilters();
      }
      */
      // Instead, we should probably set a Listing Type filter if one existed.
      // For now, removing this fixes the "Villa" default issue.
      
      if (params['debug_ai']) {
        this.offlineAi.runDiagnostics();
      }
    });
  }

  filteredProperties = computed(() => {
    const filters = this.globalState.searchFilters();
    const allProps = this.properties();
    
    return allProps.filter(prop => {
      // Filter logic (Type)
      if (filters && filters.type && filters.type !== 'all') {
         const typeMap: {[key: string]: string} = {
           'شقة': 'apartment',
           'فيلا': 'villa',
           'تاون هاوس': 'house',
           'شاليه': 'chalet',
           'دوبلكس': 'duplex',
           'بنتهاوس': 'penthouse'
         };
         
         const mappedType = typeMap[filters.type];
         if (mappedType && prop.propertyType?.toLowerCase() !== mappedType.toLowerCase()) return false;
      }

      // Filter logic (Amenities)
      if (filters.amenities.pool && !this.hasFeature(prop, 'pool', 'مسبح')) return false;
      if (filters.amenities.garden && !this.hasFeature(prop, 'garden', 'حديقة')) return false;
      if (filters.amenities.garage && !this.hasFeature(prop, 'garage', 'جراج')) return false;
      if (filters.amenities.balcony && !this.hasFeature(prop, 'balcony', 'بلكونة')) return false;
      
      return true;
    });
  });

  private hasFeature(prop: any, enKey: string, arKey: string): boolean {
    if (!prop.features) return false;
    return prop.features.some((f: string) => f.toLowerCase().includes(enKey) || f.includes(arKey));
  }

  onSmartSearch() {
    const query = this.smartSearchQuery();
    if (!query.trim()) return;

    this.isLoading.set(true);
    
    // Simulate thinking time for "AI" effect
    setTimeout(() => {
      const analysis = this.offlineAi.analyze(query);
      
      // Merge found filters
      if (analysis.filters) {
        this.localFilters = {
          ...this.localFilters,
          ...analysis.filters,
          // Merge amenities carefully
          amenities: {
            ...this.localFilters.amenities,
            ...(analysis.filters.amenities || {})
          }
        };
        
        // Auto-apply
        this.globalState.updateFilters(this.localFilters);
        this.aiAnalysisResult = signal(`تم تحليل طلبك باستخدام: ${analysis.modelUsed} (ثقة: ${Math.round(analysis.confidence * 100)}%)`);
        this.toast.show('تم تحديث الفلاتر بناءً على طلبك', 'success');
      } else {
        this.toast.show('لم أستطع فهم طلبك بدقة، حاول صيغة أخرى', 'info');
      }
      
      this.isLoading.set(false);
    }, 800);
  }

  // ... setView ...
  
  // ... rest of methods ...
  toggleFavorite(event: Event, id: string) {
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
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 600);
  }

  resetFilters() {
    this.globalState.resetFilters();
    this.localFilters = { ...this.globalState.searchFilters() };
    this.smartSearchQuery.set('');
    this.aiAnalysisResult = signal(null);
    this.toast.show('تم إعادة تعيين الفلاتر', 'info');
  }

  // --- دالة جديدة لحذف الفلاتر عند الضغط على X ---
  removeFilter(filterKey: string) {
    const current = this.globalState.searchFilters();
    const updatedFilters = { ...current };

    if (filterKey === 'type') {
      updatedFilters.type = 'شقة'; // العودة للافتراضي
    } else if (filterKey === 'pool') {
      updatedFilters.amenities = { ...current.amenities, pool: false };
    } else if (filterKey === 'garden') {
      updatedFilters.amenities = { ...current.amenities, garden: false };
    } else if (filterKey === 'garage') {
      updatedFilters.amenities = { ...current.amenities, garage: false };
    } else if (filterKey === 'balcony') {
      updatedFilters.amenities = { ...current.amenities, balcony: false };
    }

    this.globalState.updateFilters(updatedFilters);
    this.localFilters = { ...updatedFilters };
    this.toast.show('تم إزالة الفلتر', 'info');
  }

  onPageChange(event: Event, page: number) {
    event.preventDefault();
    this.currentPage.set(page);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}