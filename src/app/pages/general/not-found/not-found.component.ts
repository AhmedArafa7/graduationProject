import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [CommonModule, RouterLink],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent {
  // هذه هي "خريطة الموقع المصغرة" التي ستظهر للمستخدم التائه
  suggestedLinks = [
    { label: 'ابحث عن عقار', url: '/search', icon: 'search', description: 'تصفح آلاف العقارات المتاحة' },
    { label: 'أفضل الوكلاء', url: '/agents', icon: 'real_estate_agent', description: 'تواصل مع خبراء العقارات' },
    { label: 'المدونة العقارية', url: '/blog', icon: 'article', description: 'آخر الأخبار والنصائح' },
    { label: 'مركز المساعدة', url: '/contact', icon: 'support_agent', description: 'نحن هنا لمساعدتك' }
  ];
}