import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sitemap',
  imports: [CommonModule, RouterLink],
  templateUrl: './sitemap.component.html',
  styleUrl: './sitemap.component.scss'
})
export class SitemapComponent {
  
  sitemapSections = [
    {
      title: 'الصفحات الرئيسية',
      icon: 'home',
      links: [
        { label: 'الصفحة الرئيسية', url: '/' },
        { label: 'من نحن', url: '/about' },
        { label: 'اتصل بنا', url: '/contact' },
        { label: 'الأسئلة الشائعة', url: '/faq' }
      ]
    },
    {
      title: 'العقارات',
      icon: 'apartment',
      links: [
        { label: 'بحث عن عقار', url: '/search' },
        { label: 'خريطة العقارات', url: '/search/map' },
        { label: 'عقارات للبيع', url: '/search', queryParams: { type: 'buy' } },
        { label: 'عقارات للإيجار', url: '/search', queryParams: { type: 'rent' } }
      ]
    },
    {
      title: 'الوكلاء',
      icon: 'real_estate_agent',
      links: [
        { label: 'قائمة الوكلاء', url: '/agents' },
        { label: 'انضم كوكيل', url: '/auth/signup' } // افتراضياً لصفحة التسجيل
      ]
    },
    {
      title: 'المدونة',
      icon: 'article',
      links: [
        { label: 'الرئيسية للمدونة', url: '/blog' },
        { label: 'نصائح عقارية', url: '/blog' },
        { label: 'أخبار السوق', url: '/blog' }
      ]
    },
    {
      title: 'المستخدم',
      icon: 'person',
      links: [
        { label: 'تسجيل الدخول', url: '/auth/login' },
        { label: 'إنشاء حساب', url: '/auth/signup' },
        { label: 'نسيت كلمة المرور', url: '/auth/forgot-password' }
      ]
    },
    {
      title: 'قانوني',
      icon: 'gavel',
      links: [
        { label: 'سياسة الخصوصية', url: '/privacy-policy' },
        { label: 'شروط الخدمة', url: '/terms' }
      ]
    }
  ];
}