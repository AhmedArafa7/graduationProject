import { Component, signal, inject, OnInit, PLATFORM_ID, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';
import { Title } from '@angular/platform-browser';
import { RatingService } from '../../../core/services/rating.service';
import { AgentsService, Agent } from '../../../core/services/agents.service';
import { PropertyService, Property } from '../../../core/services/property.service';

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
      this.loadAgent(id);
    });
  }

  loadAgent(id: string) {
    const foundAgent = this.agentsService.getAgentById(id);
    if (foundAgent) {
      this.agent.set(foundAgent);
      this.titleService.setTitle(`${foundAgent.firstName} ${foundAgent.lastName} - ملف الوكيل`);
      
      const props = this.propertyService.properties().filter(p => 
        p.agent?._id === foundAgent._id
      );
      this.filteredProperties.set(props);
      
      if (isPlatformBrowser(this.platformId)) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      this.toast.show('الوكيل غير موجود', 'error');
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

  ratingDistribution = computed(() => [
    { stars: 5, percentage: 70 },
    { stars: 4, percentage: 20 },
    { stars: 3, percentage: 5 },
    { stars: 2, percentage: 2 },
    { stars: 1, percentage: 3 }
  ]);

  agentReviews = signal([
    { id: 1, author: 'محمود علي', date: 'منذ يومين', rating: 5, text: 'تعامل راقي واحترافي', avatar: 'https://i.pravatar.cc/150?u=1' },
    { id: 2, author: 'سارة أحمد', date: 'منذ أسبوع', rating: 5, text: 'ساعدتني في اختيار شقتي بدقة', avatar: 'https://i.pravatar.cc/150?u=2' }
  ]);

  newReview = {
    rating: signal(5),
    text: signal(''),
    isSubmitting: signal(false)
  };

  submitReview() {
    this.newReview.isSubmitting.set(true);
    setTimeout(() => {
      this.toast.show('تم إضافة تقييمك بنجاح', 'success');
      this.newReview.isSubmitting.set(false);
      this.newReview.text.set('');
    }, 1500);
  }

  contact(method: 'call' | 'email' | 'whatsapp') {
    const agent = this.agent();
    if (!agent) {
       this.toast.show('بيانات الاتصال غير متوفرة', 'error');
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
      navigator.clipboard.writeText(window.location.href);
      this.toast.show('تم نسخ رابط الملف الشخصي', 'success');
    }
  }
}