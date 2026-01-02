import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  imports: [CommonModule, RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  
  // قيم الشركة
  values = [
    {
      icon: 'lightbulb',
      title: 'الابتكار',
      description: 'نحن ندفع باستمرار حدود الممكن في التكنولوجيا العقارية لتقديم أفضل الحلول الذكية لعملائنا.'
    },
    {
      icon: 'verified_user',
      title: 'الشفافية',
      description: 'نؤمن بالشفافية الكاملة. نوفر بيانات دقيقة وغير متحيزة لمساعدتك على اتخاذ قرارات مستنيرة.'
    },
    {
      icon: 'groups',
      title: 'التركيز على العميل',
      description: 'احتياجاتك هي أولويتنا. نحن نصمم كل جانب من جوانب منصتنا مع وضع راحتك في الاعتبار.'
    }
  ];

  // إحصائيات
  stats = [
    { value: '10,000+', label: 'عقار مدرج' },
    { value: '5,000+', label: 'عميل سعيد' },
    { value: '1,500+', label: 'صفقة ناجحة' }
  ];

  // فريق العمل
  team = [
    {
      name: 'أحمد عرفه',
      role: 'المؤسس والرئيس التنفيذي',
      image: './Ahmed_Arafa.jpg',
    },
    {
      name: 'عبد الرحمن عطية',
      role: 'رئيس قسم التكنولوجيا',
      image: './Abdul_Rahman_Attia.png',
    },
    {
      name: 'يوسف الدغيدي',
      role: 'مدير المنتج',
      image: './Yousef_Eldegedy.png',
    },
    {
      name: 'أحمد هشام',
      role: 'رئيس قسم التسويق',
      image: './Ahmed_Hesham.png',
    },
    {
      name: 'عمر البلتاجى',
      role: 'رئيس قسم المبيعات',
      image: './Omar_Elpeltage.png',
    },
    {
      name: 'سعد السيد',
      role: 'رئيس قسم العمليات',
      image: './Saad_Elsayed.png',
    }
  ];

  // شركاء النجاح (تم وضع Amazon في النهاية)
  partners = [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2560px-Google_2015_logo.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/2560px-IBM_logo.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' 
  ];
}