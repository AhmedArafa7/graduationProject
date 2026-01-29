import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  
  // قيم الشركة
  values = signal([
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
  ]);

  // إحصائيات
  stats = signal([
    { value: '10,000+', label: 'عقار مدرج' },
    { value: '5,000+', label: 'عميل سعيد' },
    { value: '1,500+', label: 'صفقة ناجحة' }
  ]);

  // فريق العمل
  team = signal([
    {
      name: 'أحمد عرفه',
      role: 'Frontend Engineer',
      image: './Ahmed_Arafa.jpg',
    },
    {
      name: 'عبد الرحمن عطية',
      role: 'AI Engineer',
      image: './Abdul_Rahman_Atti.jpeg',
    },
    {
      name: 'يوسف الدغيدي',
      role: 'Backend Engener',
      image: './Yousef_Eldegedy.png',
    },
    {
      name: 'أحمد هشام',
      role: 'Mobile Engener',
      image: './Ahmed_Hesham.png',
    },
    {
      name: 'عمر البلتاجى',
      role: 'AI Engener',
      image: './Omar_Elpeltage.png',
    },
    {
      name: 'سعد السيد',
      role: 'AI Engener',
      image: './Saad_Elsayed.png',
    }
  ]);

  // شركاء النجاح
  partners = signal([
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2560px-Google_2015_logo.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/2560px-IBM_logo.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' 
  ]);
}
