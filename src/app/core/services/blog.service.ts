import { Injectable, signal } from '@angular/core';

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content?: string; // HTML content
  image: string;
  author: string;
  authorImage: string;
  authorTitle: string;
  date: string;
  readTime: string;
  category: string;
  views: string;
}

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  
  // قاعدة بيانات المقالات
  private posts: BlogPost[] = [
    {
      id: 1,
      title: 'مستقبل المنازل الذكية في مصر: الاتجاهات والتوقعات',
      excerpt: 'نظرة على مستقبل أسعار العقارات والفرص الاستثمارية في جميع أنحاء البلاد مع تحليل للخبراء.',
      content: `
        <p class="lead font-bold mb-4">تشهد مصر تحولًا رقميًا سريعًا، ومع هذا التحول، يزداد الاهتمام بمفهوم المنازل الذكية. لم تعد فكرة المنزل الذي يتحكم في إضاءته وتكييفه وأجهزته بكبسة زر أو أمر صوتي مجرد خيال علمي.</p>
        <h3 class="text-xl font-bold mt-6 mb-3">ما هي المنازل الذكية؟</h3>
        <p class="mb-4">المنزل الذكي هو منزل مجهز بتقنيات تسمح بالتحكم الآلي في الأنظمة المنزلية المختلفة مثل الإضاءة، والتدفئة، والتهوية، وتكييف الهواء، والأمن.</p>
        <blockquote class="border-r-4 border-primary pr-4 italic my-6 bg-gray-50 dark:bg-gray-800 p-4 rounded">"المنازل الذكية لم تعد ترفًا، بل استثمارًا في الراحة والأمان وكفاءة استهلاك الطاقة."</blockquote>
        <h3 class="text-xl font-bold mt-6 mb-3">الاتجاهات الحالية</h3>
        <ul class="list-disc list-inside space-y-2 mb-6">
          <li>زيادة الوعي والطلب على أنظمة الأمان.</li>
          <li>التحكم الصوتي عبر المساعدات الذكية.</li>
          <li>ترشيد استهلاك الطاقة.</li>
        </ul>
      `,
      category: 'تكنولوجيا العقارات',
      date: '2 أغسطس 2024',
      readTime: '8 دقائق',
      author: 'عمر المصري',
      authorTitle: 'خبير عقاري',
      authorImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
      image: 'https://images.unsplash.com/photo-1558002038-10914cba6023?q=80&w=2000&auto=format&fit=crop',
      views: '1.2k'
    },
    {
      id: 2,
      title: '5 نصائح ذهبية لتجهيز منزلك لبيع سريع وبأعلى سعر',
      excerpt: 'تعلم كيف تجعل عقارك لا يقاوم للمشترين المحتملين من خلال نصائح التجهيز البسيطة وغير المكلفة.',
      content: '<p>المحتوى التفصيلي للمقال الثاني...</p>',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2000&auto=format&fit=crop',
      author: 'فاطمة السيد',
      authorTitle: 'مهندسة ديكور',
      authorImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
      views: '980',
      date: '10 أغسطس 2023',
      readTime: '4 دقائق',
      category: 'نصائح للبائعين'
    },
    {
      id: 3,
      title: 'الساحل الشمالي: وجهة الصيف والاستثمار الأولى',
      excerpt: 'اكتشف أفضل الكمبوندات وأماكن نمط الحياة في الساحل الشمالي لمنزل عطلتك القادم.',
      content: '<p>المحتوى التفصيلي للمقال الثالث...</p>',
      image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2000&auto=format&fit=crop',
      author: 'ليلى حسن',
      authorTitle: 'محلل سوق',
      authorImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop',
      views: '2.5k',
      date: '05 أغسطس 2023',
      readTime: '7 دقائق',
      category: 'دليل المناطق'
    },
    {
      id: 4,
      title: 'كيف تختار الرهن العقاري المناسب لميزانيتك؟',
      excerpt: 'دليل شامل للمبتدئين حول أنواع التمويل العقاري المتاحة في مصر وكيفية التقديم.',
      content: '<p>المحتوى التفصيلي للمقال الرابع...</p>',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2000&auto=format&fit=crop',
      author: 'محمود جمال',
      authorTitle: 'مستشار مالي',
      authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
      views: '1.8k',
      date: '01 أغسطس 2023',
      readTime: '6 دقائق',
      category: 'استثمار عقاري'
    }
  ];

  getAllPosts() {
    return this.posts;
  }

  getPostById(id: number) {
    return this.posts.find(p => p.id === id);
  }

  getRelatedPosts(currentId: number) {
    return this.posts.filter(p => p.id !== currentId).slice(0, 3);
  }
}