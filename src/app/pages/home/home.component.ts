import { Component, signal, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FavoritesService } from '../../core/services/favorites.service';
import { PropertyService } from '../../core/services/property.service';
import { AgentsService } from '../../core/services/agents.service';
import { TestimonialsService } from '../../core/services/testimonials.service';
import { BlogService } from '../../core/services/blog.service';
import { SearchHistoryService } from '../../core/services/search-history.service';
import { ImageSearchService } from '../../core/services/image-search.service';
import { ToastService } from '../../core/services/toast.service';

import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card.component';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, FormsModule, SkeletonLoaderComponent, PropertyCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  private router = inject(Router);
  private favoritesService = inject(FavoritesService);
  private propertyService = inject(PropertyService);
  private agentsService = inject(AgentsService);
  private testimonialsService = inject(TestimonialsService);
  private blogService = inject(BlogService);

  // State Signals
  searchType = signal<'buy' | 'rent'>('buy');
  searchQuery = signal('');
  isLoading = signal(true); // Default to loading until data is ready
  
  public searchHistory = inject(SearchHistoryService);
  public imageSearch = inject(ImageSearchService);
  private toast = inject(ToastService);
  showHistoryDropdown = signal(false);

  constructor() {
    // Simulate loading/wait for signals
    setTimeout(() => this.isLoading.set(false), 800);
  }

  // Data from Services
  featuredProperties = computed(() => this.propertyService.getFeaturedProperties().map(p => ({
    ...p,
    id: p._id, // Mapping for template compatibility if needed, or update template
    locationLabel: `${p.location.city}, ${p.location.address}`,
    image: p.images[0],
    area: p.area,
    beds: p.bedrooms,
    baths: p.bathrooms,
    tag: p.status === 'sale' ? 'للبيع' : 'للإيجار'
  })));

  topAgents = this.agentsService.agents; // Use signal from AgentsService directly?
  // AgentsService now has `agents` signal. `getTopAgents` might be missing.
  // Let's rely on standard agents signal for now or add getTopAgents to service.
  // Adding computed for top agents here or assuming service has it.
  // AgentsService refactor removed `getTopAgents`.
  // I will use `this.agentsService.agents` and slice it.

  displayAgents = computed(() => this.agentsService.agents().slice(0, 4));

  testimonials = this.testimonialsService.getAllTestimonials();
  
  latestPosts = this.blogService.getAllPosts().slice(0, 3);

  setSearchType(type: 'buy' | 'rent') {
    this.searchType.set(type);
  }

  onSearch() {
    const query = this.searchQuery().trim();
    if (query) {
      this.searchHistory.addTextSearch(query);
    }
    this.router.navigate(['/search'], {
      queryParams: {
        type: this.searchType(),
        q: query
      }
    });
  }

  // --- Image Search Handlers ---
  triggerImageUpload() {
    const fileInput = document.getElementById('homeImageSearchInput') as HTMLInputElement;
    if (fileInput) fileInput.click();
  }

  async onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.showHistoryDropdown.set(false);
    
    const result = await this.imageSearch.processAndSearchImage(file);
    
    if (result) {
       this.toast.show('تم البحث بالصورة بنجاح', 'success');
       // Navigate to search page with a special flag or pass results via state
       this.router.navigate(['/search'], { queryParams: { fromImage: 'true' } });
    }
    
    input.value = '';
  }
  
  applyHistoryItem(item: any) {
     this.showHistoryDropdown.set(false);
     if (item.type === 'text') {
        this.searchQuery.set(item.query);
        this.onSearch();
     } else {
        this.toast.show('جاري استرجاع البحث بالصورة...', 'info');
        setTimeout(() => {
           this.router.navigate(['/search'], { queryParams: { fromImage: 'true' } });
        }, 500);
     }
  }

  // التحقق إذا كان العقار مفضل
  isFavorite(id: string): boolean {
    return this.favoritesService.isFavorite(id);
  }

  toggleFavorite(event: Event, id: string) {
    event.stopPropagation();
    event.preventDefault();
    this.favoritesService.toggleFavorite(id);
  }

  // تعديل: التوجيه لصفحة الرسائل الداخلية
  contactAgent(event: Event, agentId: string) { 
    event.stopPropagation();
    event.preventDefault();
    
    // هنا نوجه المستخدم لصندوق الرسائل (Message Bag)
    // يمكنك تمرير معرف الوكيل لفتح المحادثة معه مباشرة
    this.router.navigate(['/messages'], { queryParams: { with: agentId } });
  }
}