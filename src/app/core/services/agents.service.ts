import { Injectable, signal } from '@angular/core';

export interface AgentContact {
  phone: string;
  email: string;
  languages: string;
  hours: string;
  license: string;
}

export interface AgentStats {
  activeProperties: number;
  monthlyViews: string;
  inquiries: number;
  memberSince: number;
  responseRate: string;
}

export interface Agent {
  id: number;
  name: string;
  title: string;
  image: string;
  coverImage?: string;
  rating: number;
  propertiesCount: number; // Used in list view
  reviewsCount?: number;
  location: string;      // Used in list view filters
  specialty: string;     // Used in list view filters
  about?: string;
  specializations?: string[];
  contact?: AgentContact;
  stats?: AgentStats;
}

@Injectable({
  providedIn: 'root'
})
export class AgentsService {

  private agentsSignal = signal<Agent[]>([
    {
      id: 1,
      name: 'أحمد ناصر',
      title: 'مستشار عقاري أول',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFm1SUqvDoOEemrNAPmQedBCtbJ5bAI7ficzndAIuSlzz3Ylviak48CHyjovHOy-R5YHEsH9W9Du4yFs3KwdjhKoQdUNKf8q3QKq58o_G0DXGaCpKh_g1QYU0fJvFZ-a2rg6b_q4Vmz8nhsuoE92ASqyNx5v0SraftvuunM8OclX99B7-H2dftKS8te6CQuYIaAdHexoe-XIb_NQvJpk2GxdE3f8D8BjnJmM4UkCFPKuNgYxzQMi4_dYAzEsEACxtxQ032EqaZ9WQ',
      coverImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2000&auto=format&fit=crop',
      rating: 4.8,
      propertiesCount: 32,
      reviewsCount: 125,
      location: 'القاهرة الجديدة',
      specialty: 'Residential',
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
      name: 'آية محمد',
      title: 'خبير عقاري',
      image: '/hijab_aya.png',
      coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000&auto=format&fit=crop',
      rating: 4.9,
      propertiesCount: 45,
      reviewsCount: 89,
      location: 'الشيخ زايد',
      specialty: 'Luxury',
      about: `آية خبيرة في العقارات الفاخرة في الشيخ زايد والسادس من أكتوبر. تتميز بخبرتها الواسعة وتقديم استشارات استثمارية دقيقة للعملاء.`,
      specializations: ['كمبوندات الشيخ زايد', 'شقق فندقية', 'استثمار عقاري'],
      contact: {
        phone: '+201223456789',
        email: 'aya.m@baytology.ai',
        languages: 'العربية، الإنجليزية',
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
    },
    {
      id: 3,
      name: 'محمد خالد',
      title: 'وسيط تجاري',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDAEvAqDcy8oAuQZdaEghanv3aDQYp_AQihW1RQB3wc095q2sgxhpnwIVAY-P2Po-xqob-cm_9eloGQtkq7RiYX4ledolQci9ar5A-AJdRd7xUpcqIS9pSVpLEJCFiYOZ_B0qE9pmTVh1sSDx8xqxnKPxG1lXu2XVtCtALVRXrmBJf70FQTD9P4tQq9OdQKLXzwcuH-xJhCT4jEJvN3Sg9-dP1h9nJgoxbvc-1o8sM60L4dEbwLR8ILnAlZeO2RdyfSJLOGv0YNvk',
      rating: 4.7,
      propertiesCount: 28,
      location: 'المعادي',
      specialty: 'Commercial',
      about: 'خبير في العقارات التجارية والإدارية في منطقة المعادي ووسط البلد.',
      contact: {
        phone: '+201122334455',
        email: 'm.khaled@baytology.ai',
        languages: 'العربية',
        hours: '10 ص - 6 م',
        license: 'RE-54321-EG'
      },
      stats: {
        activeProperties: 28,
        monthlyViews: '8k',
        inquiries: 150,
        memberSince: 2021,
        responseRate: '90%'
      }
    },
    {
      id: 4,
      name: 'هند السيد',
      title: 'مستشار استثمار',
      image: '/hijab_hend.png',
      rating: 5.0,
      propertiesCount: 55,
      location: 'العاصمة الإدارية',
      specialty: 'Luxury',
      about: 'متخصصة في الفرص الاستثمارية بالعاصمة الإدارية الجديدة.',
      contact: {
        phone: '+201099887766',
        email: 'hend.s@baytology.ai',
        languages: 'العربية, English',
        hours: '9 ص - 5 م',
        license: 'RE-67890-EG'
      },
      stats: {
        activeProperties: 55,
        monthlyViews: '20k',
        inquiries: 400,
        memberSince: 2019,
        responseRate: '99%'
      }
    },
    {
      id: 5,
      name: 'عمرو حسين',
      title: 'وكيل عقاري',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsKTzc2oKAV6NRfSP_VKM3460bWVSdbgXP82W-B5_rX0KUtCvEAqfwDPWDc9Tpvv9uwoJr3jM-gqp_gHNSJwTYIVPPtSY0NagZkggwjOrH0VJY3ur5ObD_ChaXBvUO2S2JhlQwoOSR7tIcnJ_7_VxMjRLvSamMDTs7Ec2oIQ9bsnVPJKgXqLS3lHVpaMuY_hBVcH1kiccU1aHkZA6_i7pSJDGi5atc_yl_8RRyYgWaPcn1ULZurQuY1uL0_8QfDy9f9QkP_cPuMcE',
      rating: 4.6,
      propertiesCount: 22,
      location: 'وسط البلد',
      specialty: 'Residential'
    },
    {
      id: 6,
      name: 'رنا أحمد',
      title: 'مدير مبيعات',
      image: '/hijab_rana.png',
      rating: 4.9,
      propertiesCount: 38,
      location: 'الساحل الشمالي',
      specialty: 'Residential'
    },
    // Adding Home page agents with mapped IDs and data if needed to ensure consistency
    { id: 101, name: 'أحمد ماهر', title: 'وكيل عقاري', rating: 4.9, propertiesCount: 120, image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop', location: 'التجمع', specialty: 'Luxury' },
    { id: 102, name: 'فاطمة السيد', title: 'وكيل عقاري', rating: 4.8, propertiesCount: 95, image: '/hijab_fatima.png', location: 'زايد', specialty: 'Residential' },
    { id: 103, name: 'يوسف علي', title: 'وكيل عقاري', rating: 4.8, propertiesCount: 88, image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop', location: 'المعادي', specialty: 'Commercial' },
    { id: 104, name: 'نور حسن', title: 'وكيل عقاري', rating: 4.7, propertiesCount: 82, image: '/hijab_noor.png', location: 'الشروق', specialty: 'Residential' },
    { id: 105, name: 'مريم عادل', title: 'وكيل عقاري', rating: 4.7, propertiesCount: 75, image: '/hijab_maryam.png', location: 'العبور', specialty: 'Residential' },
    { id: 106, name: 'خالد إبراهيم', title: 'وكيل عقاري', rating: 4.6, propertiesCount: 68, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop', location: 'مدينة نصر', specialty: 'Administrative' }
  ]);

  getAllAgents() {
    return this.agentsSignal();
  }

  getTopAgents() {
    return this.agentsSignal().sort((a, b) => b.rating - a.rating).slice(0, 6);
  }

  getAgentById(id: number) {
    return this.agentsSignal().find(a => a.id === id);
  }
}
