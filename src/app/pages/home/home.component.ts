import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FavoritesService } from '../../core/services/favorites.service';
import { PropertyService } from '../../core/services/property.service';
import { AgentsService } from '../../core/services/agents.service';
import { TestimonialsService } from '../../core/services/testimonials.service';
import { BlogService } from '../../core/services/blog.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
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

  // Data from Services
  featuredProperties = this.propertyService.getFeaturedProperties().map(p => ({
    ...p,
    location: `${p.address}، ${p.city}`,
    image: p.images[0],
    area: p.areaValue
  }));

  topAgents = this.agentsService.getTopAgents();
  
  testimonials = this.testimonialsService.getAllTestimonials();
  
  latestPosts = this.blogService.getAllPosts().slice(0, 3);

  setSearchType(type: 'buy' | 'rent') {
    this.searchType.set(type);
  }

  onSearch() {
    this.router.navigate(['/search'], {
      queryParams: {
        type: this.searchType(),
        q: this.searchQuery()
      }
    });
  }

  // التحقق إذا كان العقار مفضل
  isFavorite(id: number): boolean {
    return this.favoritesService.isFavorite(id);
  }

  toggleFavorite(event: Event, id: number) {
    event.stopPropagation();
    event.preventDefault();
    this.favoritesService.toggleFavorite(id);
  }

  // تعديل: التوجيه لصفحة الرسائل الداخلية
  contactAgent(event: Event, agentId: number) { 
    event.stopPropagation();
    event.preventDefault();
    
    // هنا نوجه المستخدم لصندوق الرسائل (Message Bag)
    // يمكنك تمرير معرف الوكيل لفتح المحادثة معه مباشرة
    this.router.navigate(['/messages'], { queryParams: { with: agentId } });
  }
}