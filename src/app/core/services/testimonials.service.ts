import { Injectable, signal } from '@angular/core';

export interface Testimonial {
  name: string;
  date: string;
  rating: number;
  text: string;
  image: string;
}

@Injectable({
  providedIn: 'root'
})
export class TestimonialsService {

  private testimonialsSignal = signal<Testimonial[]>([
    {
      name: 'حسن مصطفى',
      date: '15 أغسطس 2023',
      rating: 5,
      text: "تجربة البحث بالذكاء الاصطناعي كانت مذهلة! وصفت الشقة التي أحلم بها ووجد لي النظام خيارات ممتازة في ثوانٍ.",
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop'
    },
    {
      name: 'سلمى أحمد',
      date: '22 يوليو 2023',
      rating: 4.5,
      text: "الوكيل الذي تواصلت معه كان محترفاً جداً ويعرف منطقة التجمع جيداً. شكراً Baytology.",
      image: '/hijab_salma.png'
    },
    {
      name: 'عمر خالد',
      date: '05 يونيو 2023',
      rating: 5,
      text: "كنت قلقاً كوني مشتري لأول مرة، لكن الموقع سهل عليّ كل الخطوات من البحث وحتى التعاقد.",
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop'
    }
  ]);

  getAllTestimonials() {
    return this.testimonialsSignal();
  }
}
