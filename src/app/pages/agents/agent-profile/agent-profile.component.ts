import { Component, signal, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';
import { Title } from '@angular/platform-browser';

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

  // --- Mock Data (قاعدة بيانات الوكلاء) ---
  private mockAgents = [
    {
      id: 1,
      name: 'أحمد ناصر',
      title: 'مستشار عقاري أول في Sakna.ai',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFm1SUqvDoOEemrNAPmQedBCtbJ5bAI7ficzndAIuSlzz3Ylviak48CHyjovHOy-R5YHEsH9W9Du4yFs3KwdjhKoQdUNKf8q3QKq58o_G0DXGaCpKh_g1QYU0fJvFZ-a2rg6b_q4Vmz8nhsuoE92ASqyNx5v0SraftvuunM8OclX99B7-H2dftKS8te6CQuYIaAdHexoe-XIb_NQvJpk2GxdE3f8D8BjnJmM4UkCFPKuNgYxzQMi4_dYAzEsEACxtxQ032EqaZ9WQ',
      coverImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2000&auto=format&fit=crop',
      rating: 4.8,
      reviewsCount: 125,
      about: `مع أكثر من عقد من الخبرة في سوق العقارات المصري، رسخ أحمد ناصر نفسه كمستشار رائد، متخصص في العقارات السكنية الفاخرة في القاهرة الجديدة والزمالك. التزامه برضا العملاء وفهمه العميق لاتجاهات السوق يضمن تجربة سلسة وناجحة للمشترين والبائعين على حد سواء.`,
      specializations: ['فلل فاخرة', 'عقارات تجارية', 'مشترين لأول مرة', 'فرص استثمارية'],
      contact: {
        phone: '+201001234567',
        email: 'ahmed.nasser@sakna.ai',
        languages: 'العربية، الإنجليزية',
        hours: '9 ص - 6 م',
        license: 'RE-12345-EG'
      },
      stats: {
        activeProperties: 32,
        monthlyViews: '12.5k',
        inquiries: 210,
        memberSince: 2018,
        responseRate: '95%'
      }
    },
    {
      id: 2,
      name: 'ماريا جارسيا',
      title: 'خبير عقاري دولي',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhX-3QnpmzjT6AcyIPNmjNvxuJ2kDI5Gw3Tl79KfqA4JrhO72AW1UZSynb-XgnKmJnCcG9XStC6zxdFtk4ql9s2ivQEmZzeVHVCQxNBeGwrAmVQC-I7AkWj7V7wG9yvX7oyNgxj4VhTLyhuKQEiKUpPHaKXOBpP2bj4YVjde5ocxWmr7y8tyIfEkWeg7A9EQi8a-T324mCxplbbNMTiUdNUGuodGh4DrOeSeyBcxy2N8zsZYblKo-h6g_tYzeaH91q-CY3VSbFo-Q',
      coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000&auto=format&fit=crop',
      rating: 4.9,
      reviewsCount: 89,
      about: `ماريا خبيرة في العقارات الفاخرة في الشيخ زايد والسادس من أكتوبر. تتميز بخبرتها الدولية وتقديم استشارات استثمارية دقيقة للعملاء الأجانب والمحليين.`,
      specializations: ['كمبوندات الشيخ زايد', 'شقق فندقية', 'استثمار أجنبي'],
      contact: {
        phone: '+201223456789',
        email: 'maria.g@sakna.ai',
        languages: 'العربية، الإنجليزية، الإسبانية',
        hours: '10 ص - 7 م',
        license: 'RE-98765-EG'
      },
      stats: {
        activeProperties: 45,
        monthlyViews: '15k',
        inquiries: 300,
        memberSince: 2020,
        responseRate: '98%'
      }
    }
    // يمكن إضافة المزيد هنا...
  ];

  // بيانات العقارات (ثابتة للمحاكاة حالياً)
  agentProperties = [
    {
      id: 1,
      title: 'فيلا فاخرة في قطامية هايتس',
      location: 'القاهرة الجديدة، مصر',
      price: 15000000,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWxLg78xouEDWn79_ssVlN4JjOgzYnRxwwxTMjZysvamyKxs31Sco7rrfH8VigEXR494O4mjthTSCeINq0D41yutCEAw1riHBVdIBSvvEe9Nviev2b7oPoM32gsGObvmu4tMAoEIstavLYiLUXqq1KLayL8a9HH3sF0SShnbxETM7uBrdCSrX8HDuLFhAYxXY_M5IVPLIByvnCMcbVDG0XacWCCh1C57E2oyObmq2J5cUcJlYVnYgj3sZCeyoL_3pxxg5A0iFtYcE',
      beds: 5,
      baths: 6,
      area: 750,
      type: 'بيع'
    },
    {
      id: 2,
      title: 'شقة بإطلالة نيلية',
      location: 'الزمالك، مصر',
      price: 8500000,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8NqQ72yRCuXlUA5vJWmBpcuxlKUqpfGvgR30Zej5NAiPEbX-0bCOrob3ZGNlSDXJqDPlHnl2rcWORxTNMVhpICMprO-mrgaD_TI2oIvyljTZQzMhpzDokWhH42Z23gYwRUsKhjh9--CBEeZMoglqO0MqTb7b6vMBqo8cbSrBsMBr0I7J0DGkipyJaMnfsx19UZb0knPmJ7U6b_ouN62ch6CEH6tZ7BH0EO70mXMzikmVTXDSrSRLz_6uyrISHf081uLWDRTKmfhE',
      beds: 3,
      baths: 3,
      area: 280,
      type: 'بيع'
    }
  ];

  reviews = [
    {
      author: 'فاطمة علي',
      date: 'منذ أسبوعين',
      rating: 5,
      text: 'تعامل راقي واحترافية عالية. شكراً لك.',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBl0y_wJI276MhaAOELIIEsIdsl6UYG-9Wlps0CaosTIbi06dUtchwpag0U8hanXxbyCbI5NROeHGU_ZdsU3fldffvUGUkJiw5XkMInU9mvVLjUc6wRrdCDZDWuxLrxWuAEkOE82hNphR1QyC7FrBMrzpJFdjFANF_Ol-cgOAmv2vk_Hm73o7bFiM_DoygotOYqt_rCY0NE5tmrlK2jiP0lNApL75RPShDhwpSqAJTOOSlcFURy2HEB8HnUO_ChS9VQVX_ZvutkcfI'
    },
    {
      author: 'يوسف خالد',
      date: 'منذ شهر',
      rating: 4.5,
      text: 'خبير حقيقي في المنطقة، وفر علينا وقت كثير.',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbgv0SzvV4_DPvB2NrF6bN5praqueVXDVWst0-zFiMsc0I_vU6DWgG245oQ1OOlQaE-5PCo3NUuHYvZTyoxoU6zNpmVGygid5NMBTmYcWri72sXTS052gzLH5tTrrGHVQpiVe5dydAkS12NRx5V7xAtwYAxlHW1bxlC6lAoXRc836upCc5LzAGCxFJShIEaeScrJix7fCxA3FfM56_KiAUg5txux0w-jC7KhQtmqMNz_Ob173nUAysOPzm-gMlPu6o00OTd3dJ4Dc'
    }
  ];

  ratingDistribution = [
    { stars: 5, percentage: 85 },
    { stars: 4, percentage: 10 },
    { stars: 3, percentage: 3 },
    { stars: 2, percentage: 2 },
    { stars: 1, percentage: 0 }
  ];

  // --- UI State ---
  agent = signal<any>(this.mockAgents[0]); // الوكيل الحالي
  
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
    const foundAgent = this.mockAgents.find(a => a.id === id);
    if (foundAgent) {
      this.agent.set(foundAgent);
    } else {
      this.agent.set(this.mockAgents[0]); // Fallback
    }
    
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

  contact(method: 'call' | 'email' | 'whatsapp') {
    const data = this.agent().contact;
    
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