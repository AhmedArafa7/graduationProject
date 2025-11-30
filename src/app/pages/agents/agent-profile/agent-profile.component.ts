import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-agent-profile',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './agent-profile.component.html',
  styleUrl: './agent-profile.component.scss'
})
export class AgentProfileComponent {
  // بيانات الوكيل
  agent = {
    id: 1,
    name: 'أحمد ناصر',
    title: 'مستشار عقاري أول في Sakna.ai',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFm1SUqvDoOEemrNAPmQedBCtbJ5bAI7ficzndAIuSlzz3Ylviak48CHyjovHOy-R5YHEsH9W9Du4yFs3KwdjhKoQdUNKf8q3QKq58o_G0DXGaCpKh_g1QYU0fJvFZ-a2rg6b_q4Vmz8nhsuoE92ASqyNx5v0SraftvuunM8OclX99B7-H2dftKS8te6CQuYIaAdHexoe-XIb_NQvJpk2GxdE3f8D8BjnJmM4UkCFPKuNgYxzQMi4_dYAzEsEACxtxQ032EqaZ9WQ',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCE6R0KIWeqaMjefFaJzSHwfgpcFRaoyyT-IKBiJLJG37jQPHHjB7WP2gr-ZdxAtRG7gV_WJ47ewwK4T2Qgh7gNzzrFJ0MhrruSq8e34W9V2UUB8rVBqAXFgV8JXpBDLvKawzr5HD0i8mXC4fI2jwNF-BXdA3vOW_LTxvMePXoQ-aLRaKa6R1ylfJDmuQaBGqgtb5aNAh-YeknrYXkaQnNRg6CD1yTso48ZJABQB5Wq4GYLiJMoiBL0Uo_jlydj482uouyKW2GA7wI',
    rating: 4.8,
    reviewsCount: 125,
    about: `مع أكثر من عقد من الخبرة في سوق العقارات المصري، رسخ أحمد ناصر نفسه كمستشار رائد، متخصص في العقارات السكنية الفاخرة في القاهرة الجديدة والزمالك. التزامه برضا العملاء وفهمه العميق لاتجاهات السوق يضمن تجربة سلسة وناجحة للمشترين والبائعين على حد سواء. يؤمن أحمد ببناء علاقات طويلة الأمد قائمة على الثقة والنزاهة والخدمة التي لا مثيل لها.`,
    specializations: ['فلل فاخرة', 'عقارات تجارية', 'مشترين لأول مرة', 'فرص استثمارية'],
    contact: {
      phone: '+20 100 123 4567',
      email: 'ahmed.nasser@sakna.ai',
      languages: 'العربية، الإنجليزية',
      hours: '9 ص - 6 م',
      license: 'RE-12345-EG'
    },
    stats: {
      activeProperties: 52,
      monthlyViews: '12.5k',
      inquiries: 210,
      memberSince: 2018,
      responseRate: '95%'
    }
  };

  // إحصائيات التقييم التفصيلية (للبارات)
  ratingDistribution = [
    { stars: 5, percentage: 85 },
    { stars: 4, percentage: 10 },
    { stars: 3, percentage: 3 },
    { stars: 2, percentage: 2 },
    { stars: 1, percentage: 0 }
  ];

  // عقارات الوكيل
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

  // المراجعات
  reviews = [
    {
      author: 'فاطمة علي',
      date: 'منذ أسبوعين',
      rating: 5,
      text: 'أحمد كان متعاوناً ومحترفاً للغاية. وجد لنا المنزل المثالي في حدود ميزانيتنا. نوصي به بشدة!',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBl0y_wJI276MhaAOELIIEsIdsl6UYG-9Wlps0CaosTIbi06dUtchwpag0U8hanXxbyCbI5NROeHGU_ZdsU3fldffvUGUkJiw5XkMInU9mvVLjUc6wRrdCDZDWuxLrxWuAEkOE82hNphR1QyC7FrBMrzpJFdjFANF_Ol-cgOAmv2vk_Hm73o7bFiM_DoygotOYqt_rCY0NE5tmrlK2jiP0lNApL75RPShDhwpSqAJTOOSlcFURy2HEB8HnUO_ChS9VQVX_ZvutkcfI'
    },
    {
      author: 'يوسف خالد',
      date: 'منذ شهر',
      rating: 4.5,
      text: 'خبير حقيقي في منطقة الزمالك. كانت العملية سلسة من البداية للنهاية. نحن سعداء جداً بشقتنا الجديدة.',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbgv0SzvV4_DPvB2NrF6bN5praqueVXDVWst0-zFiMsc0I_vU6DWgG245oQ1OOlQaE-5PCo3NUuHYvZTyoxoU6zNpmVGygid5NMBTmYcWri72sXTS052gzLH5tTrrGHVQpiVe5dydAkS12NRx5V7xAtwYAxlHW1bxlC6lAoXRc836upCc5LzAGCxFJShIEaeScrJix7fCxA3FfM56_KiAUg5txux0w-jC7KhQtmqMNz_Ob173nUAysOPzm-gMlPu6o00OTd3dJ4Dc'
    }
  ];

  // نموذج الاجتماع
  meetingRequest = {
    name: '',
    phone: '',
    date: ''
  };

  submitRequest() {
    // Logic implementation
    console.log('Form Submitted', this.meetingRequest);
  }
}