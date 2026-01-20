import { Component, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-agents-list',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './agents-list.component.html',
  styleUrl: './agents-list.component.scss'
})
export class AgentsListComponent {
  private router = inject(Router);
  private toast = inject(ToastService);
  private platformId = inject(PLATFORM_ID); // لحل مشكلة window

  // --- Filters State ---
  searchQuery = signal('');
  locationFilter = signal('');
  specialtyFilter = signal('All');
  ratingFilter = signal(0);

  // --- Pagination ---
  currentPage = signal(1);

  // --- Mock Data ---
  agents = [
    {
      id: 1,
      name: 'أحمد ناصر',
      role: 'مستشار عقاري أول',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFm1SUqvDoOEemrNAPmQedBCtbJ5bAI7ficzndAIuSlzz3Ylviak48CHyjovHOy-R5YHEsH9W9Du4yFs3KwdjhKoQdUNKf8q3QKq58o_G0DXGaCpKh_g1QYU0fJvFZ-a2rg6b_q4Vmz8nhsuoE92ASqyNx5v0SraftvuunM8OclX99B7-H2dftKS8te6CQuYIaAdHexoe-XIb_NQvJpk2GxdE3f8D8BjnJmM4UkCFPKuNgYxzQMi4_dYAzEsEACxtxQ032EqaZ9WQ',
      rating: 4.8,
      propertiesCount: 32,
      location: 'القاهرة الجديدة',
      specialty: 'Residential'
    },
    {
      id: 2,
      name: 'آية محمد',
      role: 'خبير عقاري',
      image: '/hijab_aya.png',
      rating: 4.9,
      propertiesCount: 45,
      location: 'الشيخ زايد',
      specialty: 'Luxury'
    },
    {
      id: 3,
      name: 'محمد خالد',
      role: 'وسيط تجاري',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDAEvAqDcy8oAuQZdaEghanv3aDQYp_AQihW1RQB3wc095q2sgxhpnwIVAY-P2Po-xqob-cm_9eloGQtkq7RiYX4ledolQci9ar5A-AJdRd7xUpcqIS9pSVpLEJCFiYOZ_B0qE9pmTVh1sSDx8xqxnKPxG1lXu2XVtCtALVRXrmBJf70FQTD9P4tQq9OdQKLXzwcuH-xJhCT4jEJvN3Sg9-dP1h9nJgoxbvc-1o8sM60L4dEbwLR8ILnAlZeO2RdyfSJLOGv0YNvk',
      rating: 4.7,
      propertiesCount: 28,
      location: 'المعادي',
      specialty: 'Commercial'
    },
    {
      id: 4,
      name: 'هند السيد',
      role: 'مستشار استثمار',
      image: '/hijab_hend.png',
      rating: 5.0,
      propertiesCount: 55,
      location: 'العاصمة الإدارية',
      specialty: 'Luxury'
    },
    {
      id: 5,
      name: 'عمرو حسين',
      role: 'وكيل عقاري',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsKTzc2oKAV6NRfSP_VKM3460bWVSdbgXP82W-B5_rX0KUtCvEAqfwDPWDc9Tpvv9uwoJr3jM-gqp_gHNSJwTYIVPPtSY0NagZkggwjOrH0VJY3ur5ObD_ChaXBvUO2S2JhlQwoOSR7tIcnJ_7_VxMjRLvSamMDTs7Ec2oIQ9bsnVPJKgXqLS3lHVpaMuY_hBVcH1kiccU1aHkZA6_i7pSJDGi5atc_yl_8RRyYgWaPcn1ULZurQuY1uL0_8QfDy9f9QkP_cPuMcE',
      rating: 4.6,
      propertiesCount: 22,
      location: 'وسط البلد',
      specialty: 'Residential'
    },
    {
      id: 6,
      name: 'رنا أحمد',
      role: 'مدير مبيعات',
      image: '/hijab_rana.png',
      rating: 4.9,
      propertiesCount: 38,
      location: 'الساحل الشمالي',
      specialty: 'Residential'
    }
  ];

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

  contactAgent(id: number) {
    this.router.navigate(['/messages'], { queryParams: { with: id } });
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