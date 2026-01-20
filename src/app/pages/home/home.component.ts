import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FavoritesService } from '../../core/services/favorites.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private router = inject(Router);
  private favoritesService = inject(FavoritesService);

  // State Signals
  searchType = signal<'buy' | 'rent'>('buy');
  searchQuery = signal('');

  setSearchType(type: 'buy' | 'rent') {
    this.searchType.set(type);
  }

  onSearch() {
    this.router.navigate(['/search'], {
      queryParams: {
        type: this.searchType(),
        q: this.searchQuery()
      }
    });
  }

  // التحقق إذا كان العقار مفضل
  isFavorite(id: number): boolean {
    return this.favoritesService.isFavorite(id);
  }

  toggleFavorite(event: Event, id: number) {
    event.stopPropagation();
    event.preventDefault();
    this.favoritesService.toggleFavorite(id);
  }

  // تعديل: التوجيه لصفحة الرسائل الداخلية
  contactAgent(event: Event, agentId: number) { // غيرت الاسم لـ agentId أو نستخدم الاسم كمعرف مؤقت
    event.stopPropagation();
    event.preventDefault();
    
    // هنا نوجه المستخدم لصندوق الرسائل (Message Bag)
    // يمكنك تمرير معرف الوكيل لفتح المحادثة معه مباشرة
    this.router.navigate(['/messages'], { queryParams: { with: agentId } });
  }

  // --- البيانات (Mock Data) ---
  featuredProperties = [
    {
      id: 1,
      title: 'فيلا مودرن في التجمع الخامس',
      location: 'القاهرة الجديدة، القاهرة',
      price: '12,000,000',
      image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1000&auto=format&fit=crop',
      beds: 5,
      baths: 6,
      area: 450,
      tag: 'مقترح لك'
    },
    {
      id: 2,
      title: 'شقة بإطلالة على النيل',
      location: 'الزمالك، القاهرة',
      price: '5,500,000',
      image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=1000&auto=format&fit=crop',
      beds: 3,
      baths: 2,
      area: 210,
      tag: 'مميز'
    },
    {
      id: 3,
      title: 'تاون هاوس في الشيخ زايد',
      location: 'الشيخ زايد، الجيزة',
      price: '3,200,000',
      image: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?q=80&w=1000&auto=format&fit=crop',
      beds: 4,
      baths: 3,
      area: 280,
      tag: 'جديد'
    },
    {
      id: 4,
      title: 'شاليه في الساحل الشمالي',
      location: 'الساحل الشمالي',
      price: '2,800,000',
      image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1000&auto=format&fit=crop',
      beds: 2,
      baths: 1,
      area: 120,
      tag: 'فرصة'
    }
  ];

  topAgents = [
    { id: 101, name: 'أحمد ماهر', rating: 4.9, propertiesCount: 120, image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop' },
    { id: 102, name: 'فاطمة السيد', rating: 4.8, propertiesCount: 95, image: '/hijab_fatima.png' },
    { id: 103, name: 'يوسف علي', rating: 4.8, propertiesCount: 88, image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop' },
    { id: 104, name: 'نور حسن', rating: 4.7, propertiesCount: 82, image: '/hijab_noor.png' },
    { id: 105, name: 'مريم عادل', rating: 4.7, propertiesCount: 75, image: '/hijab_maryam.png' },
    { id: 106, name: 'خالد إبراهيم', rating: 4.6, propertiesCount: 68, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' }
  ];

  testimonials = [
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
  ];

  latestPosts = [
    {
      id: 1,
      title: '5 نصائح مهمة عند شراء أول منزل لك',
      category: 'نصائح',
      excerpt: 'تعرف على أهم النصائح التي يجب مراعاتها عند اتخاذ قرار شراء منزلك الأول...',
      author: 'ندى محمود',
      date: '20 أغسطس 2023',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 2,
      title: 'مستقبل العقارات في العاصمة الإدارية',
      category: 'تحليل السوق',
      excerpt: 'تحليل شامل لاتجاهات سوق العقارات في العاصمة الإدارية والفرص الاستثمارية...',
      author: 'فريق Baytology',
      date: '18 أغسطس 2023',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 3,
      title: 'أفكار ديكور حديثة للمساحات الصغيرة',
      category: 'ديكور',
      excerpt: 'استلهم أفكارًا ذكية وعصرية لتحقيق أقصى استفادة من المساحات الصغيرة...',
      author: 'سارة علي',
      date: '15 أغسطس 2023',
      image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop'
    }
  ];
}