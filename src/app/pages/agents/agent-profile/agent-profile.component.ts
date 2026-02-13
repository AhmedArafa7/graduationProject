import { Component, signal, inject, OnInit, PLATFORM_ID, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';
import { Title } from '@angular/platform-browser';
import { RatingService } from '../../../core/services/rating.service';
import { AgentsService } from '../../../core/services/agents.service';
import { Agent } from '../../../core/models/agent.model';
import { PropertyService } from '../../../core/services/property.service';
import { Property } from '../../../core/models/property.model';

@Component({
  selector: 'app-agent-profile',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './agent-profile.component.html',
  styleUrl: './agent-profile.component.scss'
})
export class AgentProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  private titleService = inject(Title);
  private platformId = inject(PLATFORM_ID);
  private agentsService = inject(AgentsService);
  private propertyService = inject(PropertyService);
  private ratingService = inject(RatingService);
  
  // --- UI State ---
  agent = signal<Agent | undefined>(undefined);

  // --- Helpers ---
  fullName = computed(() => {
    const a = this.agent();
    return a ? `${a.firstName} ${a.lastName}` : '';
  });

  // --- Properties from Service ---
  agentPropertiesSignal = computed(() => {
    const currentAgent = this.agent();
    if (!currentAgent) return [];
    
    // Match properties by Agent ID
    return this.propertyService.properties().filter(p => 
      p.agent?._id === currentAgent._id
    );
  });
  
  agentProperties = this.agentPropertiesSignal;
  filteredProperties = signal<Property[]>([]); 

  // --- Form Data ---
  meetingRequest = {
    name: signal(''),
    phone: signal(''),
    date: signal('')
  };

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) this.loadAgent(id);
    });
  }

  loadAgent(id: string) {
    this.agentsService.getAgent(id).subscribe({
      next: (agent) => this.setAgentData(agent),
      error: () => this.toast.show('الوكيل غير موجود', 'error')
    });
  }

  private setAgentData(agent: Agent) {
    this.agent.set(agent);
    this.titleService.setTitle(`${agent.firstName} ${agent.lastName} - ملف الوكيل`);
    
    // Filter properties for this agent
    // Note: This relies on properties already being loaded in PropertyService
    // Ideally, we should fetch agent specific properties via API too if not found
    const props = this.propertyService.properties().filter(p => 
      p.agent?._id === agent._id
    );
    this.filteredProperties.set(props);
    
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  submitRequest() {
    if (!this.meetingRequest.name() || !this.meetingRequest.phone() || !this.meetingRequest.date()) {
      this.toast.show('يرجى ملء جميع الحقول المطلوبة', 'error');
      return;
    }
    this.toast.show('تم إرسال طلبك بنجاح! سيتواصل معك الوكيل قريباً.', 'success');
    this.meetingRequest.name.set('');
    this.meetingRequest.phone.set('');
    this.meetingRequest.date.set('');
  }

  // --- Helpers ---
  agentRating = computed(() => this.agent()?.agentProfile?.rating || 0);
  reviewsCount = computed(() => this.agent()?.agentProfile?.reviewsCount || 0);

  // Helper for UI to get displayable specialization array
  agentSpecializations = computed(() => {
    const spec = this.agent()?.agentProfile?.specialization;
    return spec ? spec.split(',').map(s => s.trim()) : [];
  });

  ratingDistribution = computed(() => {
    const reviews = this.agentReviews();
    const total = reviews.length;
    
    if (total === 0) {
      return [
        { stars: 5, percentage: 0 },
        { stars: 4, percentage: 0 },
        { stars: 3, percentage: 0 },
        { stars: 2, percentage: 0 },
        { stars: 1, percentage: 0 }
      ];
    }

    return [5, 4, 3, 2, 1].map(stars => {
      // Fuzzy matching for rating (e.g. 4.5 -> 5) or strict integer matching?
      // Usually distribution counts exact stars or rounded. using round here.
      const count = reviews.filter(r => Math.round(r.rating) === stars).length;
      return {
        stars,
        percentage: Math.round((count / total) * 100)
      };
    });
  });

  // --- Reviews ---
  // Use RatingService to get real reviews
  agentReviews = computed(() => this.ratingService.getReviews(this.agent()?._id || '', 'agent')());


  newReview = {
    rating: signal(5),
    text: signal(''),
    isSubmitting: signal(false)
  };

  submitReview() {
    const agentId = this.agent()?._id;
    if (!agentId) return;

    if (!this.newReview.text()) {
      this.toast.show('يرجى كتابة تعليق', 'error');
      return;
    }

    this.newReview.isSubmitting.set(true);
    
    // Use real API
    this.ratingService.addReview(
      agentId,
      'agent',
      this.newReview.rating(),
      this.newReview.text()
    ).subscribe({
      next: () => {
        this.toast.show('تم إضافة تقييمك بنجاح', 'success');
        this.newReview.isSubmitting.set(false);
        this.newReview.text.set('');
        this.newReview.rating.set(5);
      },
      error: (err) => {
        console.error(err);
        this.toast.show('حدث خطأ أثناء إضافة التقييم', 'error');
        this.newReview.isSubmitting.set(false);
      }
    });
  }

  contact(method: 'call' | 'email' | 'whatsapp') {
    const agent = this.agent();
    if (!agent) {
       this.toast.show('بيانات الاتصال غير متوفرة', 'error');
       return;
    }
    
    // SSR Safety - window only available in browser
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    if (method === 'call') {
      window.open(`tel:${agent.phone}`, '_self');
    } else if (method === 'email') {
      window.open(`mailto:${agent.email}`, '_self');
    } else if (method === 'whatsapp') {
      const url = `https://wa.me/${agent.phone}`;
      window.open(url, '_blank');
    }
  }

  shareProfile() {
    if (isPlatformBrowser(this.platformId)) {
      navigator.clipboard?.writeText(window.location.href)
        .then(() => {
          this.toast.show('تم نسخ رابط الملف الشخصي', 'success');
        })
        .catch(() => {
          this.toast.show('فشل نسخ الرابط', 'error');
        });
    }
  }
}