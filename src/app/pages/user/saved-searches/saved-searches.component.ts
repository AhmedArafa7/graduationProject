import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AgentSidebarComponent } from '../../../shared/agent-sidebar/agent-sidebar.component';
import { SavedSearchService } from '../../../core/services/saved-search.service';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { GlobalStateService } from '../../../core/services/global-state.service';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-saved-searches',
  standalone: true,
  imports: [CommonModule, RouterLink, AgentSidebarComponent, SkeletonLoaderComponent],
  templateUrl: './saved-searches.component.html',
  styleUrl: './saved-searches.component.scss'
})
export class SavedSearchesComponent implements OnInit {
  private savedSearchService = inject(SavedSearchService);
  private userService = inject(UserService);
  private globalState = inject(GlobalStateService);
  private toast = inject(ToastService);
  private router = inject(Router);

  savedSearches = signal<any[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.loadSavedSearches();
  }

  loadSavedSearches() {
    const userId = this.userService.userData()._id;
    if (!userId) return;

    this.isLoading.set(true);
    this.savedSearchService.getSavedSearches(userId).subscribe({
      next: (data) => {
        this.savedSearches.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.show('فشل تحميل عمليات البحث المحفوظة', 'error');
        this.isLoading.set(false);
      }
    });
  }

  applySearch(search: any) {
    this.globalState.updateFilters(search.criteria);
    this.router.navigate(['/search']);
    this.toast.show(`تم تطبيق فلاتر: ${search.name}`, 'success');
  }

  deleteSearch(event: Event, id: string) {
    event.stopPropagation();
    if (!confirm('هل أنت متأكد من حذف هذا البحث؟')) return;

    this.savedSearchService.deleteSavedSearch(id).subscribe({
      next: () => {
        this.savedSearches.update(searches => searches.filter(s => s._id !== id));
        this.toast.show('تم حذف البحث بنجاح', 'success');
      },
      error: () => this.toast.show('فشل حذف البحث', 'error')
    });
  }

  getCriteriaSummary(criteria: any): string {
    const parts = [];
    if (criteria.type && criteria.type !== 'all') parts.push(criteria.type);
    if (criteria.transactionType && criteria.transactionType !== 'all') parts.push(criteria.transactionType === 'buy' ? 'بيع' : 'إيجار');
    if (criteria.location && criteria.location.city) parts.push(criteria.location.city);
    if (criteria.priceFrom || criteria.priceTo) parts.push('السعر المحدد');
    
    return parts.length > 0 ? parts.join('، ') : 'كل العقارات';
  }
}
