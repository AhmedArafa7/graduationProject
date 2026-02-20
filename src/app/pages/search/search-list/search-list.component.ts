import { Component, signal, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GlobalStateService } from '../../../core/services/global-state.service';
import { SearchFilters } from '../../../core/models/search-filters.model';
import { ToastService } from '../../../core/services/toast.service';
import { PropertyService } from '../../../core/services/property.service';
import { Property } from '../../../core/models/property.model';
import { OfflineAiService } from '../../../core/services/offline-ai.service';
import { UserService } from '../../../core/services/user.service';
import { SavedSearchService } from '../../../core/services/saved-search.service';

import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ImageFallbackDirective } from '../../../shared/directives/image-fallback.directive';
import { PropertyCardComponent } from '../../../shared/components/property-card/property-card.component';

@Component({
  selector: 'app-search-list',
  imports: [CommonModule, RouterLink, FormsModule, SkeletonLoaderComponent, ImageFallbackDirective, PropertyCardComponent],
  templateUrl: './search-list.component.html',
  styleUrl: './search-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchListComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  public globalState = inject(GlobalStateService);
  private toast = inject(ToastService);
  private propertyService = inject(PropertyService);
  private offlineAi = inject(OfflineAiService);
  private userService = inject(UserService);
  private savedSearchService = inject(SavedSearchService);

  viewMode = signal<'grid' | 'list'>('grid');
  currentPage = signal(1);
  isLoading = signal(false);
  isMobileFiltersOpen = signal(false); // Mobile Filter Drawer State
  
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
      // FIX: Handle Buy/Rent filter from header
      const t = params['type'];
      
      if (t === 'rent') {
          this.localFilters.transactionType = 'rent';
      } else if (t === 'buy' || t === 'sale') {
          this.localFilters.transactionType = 'buy';
      } else {
          // If no param or unknown, reset to 'all'
          this.localFilters.transactionType = 'all';
      }
      this.applyFilters();
      
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

      // Filter logic (Transaction Type: Buy/Rent)
      if (filters.transactionType && filters.transactionType !== 'all') {
        const propType = prop.type === 'sale' ? 'buy' : 'rent';
        if (filters.transactionType !== propType) return false;
      }

      // Filter logic (Amenities)
      if (filters.amenities.pool && !this.hasFeature(prop, 'pool', 'مسبح')) return false;
      if (filters.amenities.garden && !this.hasFeature(prop, 'garden', 'حديقة')) return false;
      if (filters.amenities.garage && !this.hasFeature(prop, 'garage', 'جراج')) return false;
      if (filters.amenities.balcony && !this.hasFeature(prop, 'balcony', 'بلكونة')) return false;
      
      return true;
    });
  });

  private hasFeature(prop: Property, enKey: string, arKey: string): boolean {
    if (!prop.features) return false;
    return prop.features.some((f: string) => f.toLowerCase().includes(enKey) || f.includes(arKey));
  }

  onSmartSearch() {
    const query = this.smartSearchQuery();
    if (!query.trim()) return;

    this.isLoading.set(true);
    
    // Direct call without delay
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
    if (!this.userService.isLoggedIn()) {
      this.toast.show('يرجى تسجيل الدخول أولاً لحفظ البحث', 'info');
      return;
    }
    
    this.savedSearchService.saveSearch({
      userId: this.userService.userData()._id,
      name: `بحث ${new Date().toLocaleDateString('ar-EG')}`,
      criteria: this.localFilters
    }).subscribe({
      next: () => this.toast.show('تم حفظ البحث بنجاح! سنرسل لك تنبيهات للعقارات الجديدة.', 'success'),
      error: () => this.toast.show('حدث خطأ أثناء حفظ البحث', 'error')
    });
  }

  toggleMobileFilters() {
    this.isMobileFiltersOpen.update(v => !v);
  }

  applyFilters() {
    this.isLoading.set(true);
    // Instant update
    this.globalState.updateFilters(this.localFilters);
    this.isLoading.set(false);
    this.toast.show('تم تحديث نتائج البحث', 'success');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  resetFilters() {
    this.globalState.resetFilters();
    this.localFilters = { ...this.globalState.searchFilters() };

    // FIX: Restore transaction type if we are on a specific page (Buy/Rent)
    const t = this.route.snapshot.queryParams['type'];
    if (t === 'rent') {
       this.localFilters.transactionType = 'rent';
    } else if (t === 'buy' || t === 'sale') {
       this.localFilters.transactionType = 'buy';
    }
    // Update global again with restored type
    this.globalState.updateFilters(this.localFilters);

    this.smartSearchQuery.set('');
    this.aiAnalysisResult = signal(null);
    
    // Force re-fetch/update local state
    this.isLoading.set(true);
    setTimeout(() => {
      this.isLoading.set(false);
      this.toast.show('تم إعادة تعيين الفلاتر', 'info');
    }, 300);
  }

  // --- دالة جديدة لحذف الفلاتر عند الضغط على X ---
  removeFilter(filterKey: string) {
    const current = this.globalState.searchFilters();
    const updatedFilters = { ...current };

    if (filterKey === 'type') {
      updatedFilters.type = 'الكل'; // Reset to "All" (User defined 'الكل')
    } else if (filterKey === 'pool') {
      updatedFilters.amenities = { ...current.amenities, pool: false };
    } else if (filterKey === 'garden') {
      updatedFilters.amenities = { ...current.amenities, garden: false };
    } else if (filterKey === 'garage') {
      updatedFilters.amenities = { ...current.amenities, garage: false };
    } else if (filterKey === 'balcony') {
      updatedFilters.amenities = { ...current.amenities, balcony: false };
    } else if (filterKey === 'transactionType') {
      updatedFilters.transactionType = 'all';
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