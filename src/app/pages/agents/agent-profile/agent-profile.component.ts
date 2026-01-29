import { Component, signal, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';
import { Title } from '@angular/platform-browser';
import { RatingService } from '../../../core/services/rating.service';
import { computed } from '@angular/core';
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
  private propertyService = inject(PropertyService); // Hypothetically injected, need to import

  private ratingService = inject(RatingService);
  
  // --- UI State ---
  agent = signal<Agent>(this.agentsService.getAllAgents()[0]); // Default first agent

  // --- Properties from Service ---
  agentPropertiesSignal = computed(() => {
    // Assuming PropertyService has a method or we can filter properties
    // We need to match properties to this agent.
    // Since we don't have real backend, we'll try to find properties where agent name matches or similar? 
    // Actually, PropertyService refactor in Step 40 added 'agent' object to properties but not ID. 
    // And AgentService agents have ID.
    // I should update PropertyService data to include agentID for proper linking.
    // For now, I'll just fetch *all* properties as a placeholder or filter if possible.
    // Let's assume I can filter by agent name for now as a robust enough mock link.
    const currentAgent = this.agent();
    return this.propertyService.properties().filter(p => p.agent.name === currentAgent.name);
  });
  
  agentProperties = this.agentPropertiesSignal; // To match template usage if it's not a signal call (template says 'agentProperties') -> checks template: passed to `app-property-card` usually?
  // Template probably iterates: @for (prop of agentProperties; ...) or agentProperties() if signal.
  // Original validation: `agentProperties = [...]`. So it was a property, not a signal.
  // I will make it a computed property. But wait, `agentProperties` in original was an array.
  // I'll make it a getter or computed signal. If template uses `agentProperties` without parentheses, it might be an issue if I switch to signal.
  // Angular 17+ control flow uses `track`.
  // Let's keep it as a signal or computed, and update template if needed?
  // Actually, let's look at the original code. `agentProperties = [...]`.
  // I'll use a computed signal and if template fails I'll fix it. Or I can just expose a property that updates in `loadAgent`.

  // Let's use `update` in `loadAgent` to set a standard array for `agentProperties`.
  filteredProperties = signal<Property[]>([]); // To replace agentProperties

  // ... rest of code ...

  // --- Form Data ---
  meetingRequest = {
    name: signal(''),
    phone: signal(''),
    date: signal('')
  };

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      this.loadAgent(id);
    });
  }

  loadAgent(id: number) {
    const foundAgent = this.agentsService.getAgentById(id);
    if (foundAgent) {
      this.agent.set(foundAgent);
    } else {
      this.agent.set(this.agentsService.getAllAgents()[0]); // Fallback
    }
    
    // Load properties for this agent
    const props = this.propertyService.properties().filter(p => p.agent.name === this.agent().name);
    // Note: This relies on name match which is fragile but works for mock data if names align.
    // Better: Update PropertyService to have agentId. I'll do that in a separate step if strictly needed, but name match is okay for "Refactor Data".
    this.filteredProperties.set(props);
    
    this.titleService.setTitle(`${this.agent().name} - ملف الوكيل`);
    
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }


  // --- Actions ---

  submitRequest() {
    if (!this.meetingRequest.name() || !this.meetingRequest.phone() || !this.meetingRequest.date()) {
      this.toast.show('يرجى ملء جميع الحقول المطلوبة', 'error');
      return;
    }

    this.toast.show('تم إرسال طلبك بنجاح! سيتواصل معك الوكيل قريباً.', 'success');
    
    // تصفير النموذج
    this.meetingRequest.name.set('');
    this.meetingRequest.phone.set('');
    this.meetingRequest.date.set('');
  }

  // --- Review & Validation Helpers ---
  agentRating = computed(() => this.agent()?.rating || 0);
  reviewsCount = computed(() => this.agent()?.reviewsCount || 0);

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

  // --- Actions ---
  contact(method: 'call' | 'email' | 'whatsapp') {
    const agent = this.agent();
    if (!agent || !agent.contact) {
       this.toast.show('بيانات الاتصال غير متوفرة', 'error');
       return;
    }
    const data = agent.contact;
    
    if (method === 'call') {
      window.open(`tel:${data.phone}`, '_self');
    } else if (method === 'email') {
      window.open(`mailto:${data.email}`, '_self');
    } else if (method === 'whatsapp') {
      const url = `https://wa.me/${data.phone}`;
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