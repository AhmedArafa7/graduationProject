import { Component, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';
import { MessagesService } from '../../../core/services/messages.service';
import { AgentsService } from '../../../core/services/agents.service';

@Component({
  selector: 'app-agents-list',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './agents-list.component.html',
  styleUrl: './agents-list.component.scss'
})
export class AgentsListComponent {
  private router = inject(Router);
  private toast = inject(ToastService);
  private platformId = inject(PLATFORM_ID);
  private messagesService = inject(MessagesService);
  private agentsService = inject(AgentsService); // Service Injection

  // --- Filters State ---
  searchQuery = signal('');
  locationFilter = signal('');
  specialtyFilter = signal('All');
  ratingFilter = signal(0);

  // --- Pagination ---
  currentPage = signal(1);

  // --- Data from Service ---
  // Mapping 'title' to 'role' to match template if needed, or simply using the service objects
  // The template likely uses 'agent.name', 'agent.image', 'agent.location', 'agent.rating', etc.
  // We added 'title' in service, template was using 'role'. Let's map it or update template?
  // Easier to map here for minimal template changes, or just rely on similarity.
  // Agent interface has 'title', Component had 'role'. Let's map title->role.
  
  agents = this.agentsService.getAllAgents().map(a => ({
    ...a,
    role: a.title 
  }));

  // --- Filter Logic ---
  filteredAgents = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const loc = this.locationFilter().toLowerCase();
    const spec = this.specialtyFilter();
    const rate = this.ratingFilter();

    return this.agents.filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(query);
      const matchesLoc = !loc || agent.location.toLowerCase().includes(loc);
      const matchesSpec = spec === 'All' || agent.specialty === spec;
      const matchesRate = agent.rating >= rate;

      return matchesSearch && matchesLoc && matchesSpec && matchesRate;
    });
  });

  // --- Actions ---
  setSpecialty(type: string) {
    this.specialtyFilter.set(type);
  }

  resetFilters() {
    this.searchQuery.set('');
    this.locationFilter.set('');
    this.specialtyFilter.set('All');
    this.ratingFilter.set(0);
    this.toast.show('تم إعادة تعيين الفلاتر', 'info');
  }

  contactAgent(agent: { id: number; name: string; image: string }) {
    // إنشاء أو فتح محادثة مع الوكيل
    const conversationId = this.messagesService.startChatWithAgent(
      agent.name,
      agent.image,
      'استفسار عن العقارات المتاحة'
    );
    this.router.navigate(['/messages'], { queryParams: { chat: conversationId } });
  }

  applyFilters() {
    this.toast.show('تم تحديث قائمة الوكلاء', 'success');
    this.scrollToTop();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.scrollToTop();
  }

  // دالة مساعدة للتمرير للأعلى مع حماية SSR
  private scrollToTop() {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}