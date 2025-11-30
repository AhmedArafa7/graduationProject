import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-blog-details',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './blog-details.component.html',
  styleUrl: './blog-details.component.scss'
})
export class BlogDetailsComponent {
  // بيانات المقال (Mock Data)
  article = {
    id: 1,
    title: 'مستقبل المنازل الذكية في مصر: الاتجاهات والتوقعات',
    category: 'تكنولوجيا العقارات',
    date: '2 أغسطس 2024',
    readTime: '8 دقائق قراءة',
    author: 'عمر المصري',
    authorTitle: 'خبير عقاري',
    authorImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkLFu_xwKsRV6IczQ79lv0Ulkxa0bR9D4jsvEiS0gEnhPjiT095S6LPk9g-yFhk-OkcE4_bVk2cUQ2TZ4XsXskPrGyOSVSH5nJ6mz-W8avarU5sl5HxxYDXdoqvxY9SzlWu_RdL2j5lYRr9J01J4meE7mlomVhCAZ38_Np4KmdufEsABrpU98L95CiTigP_QpYvUMwHsFjYkOR0chKk0wOu1z_YRZQwt1j-Ew-iVlJ-8D5n34VWXE8wVreM_D-QHHH2kONb1mg_Vo',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAX41-TFfTOe8OjrPt_sgiOinvNKYRrX1eGFeYE9UD_xRCxOV9Yf0jh_UOQKTVrWXvW1DWT37NFwCX80muBHbtFDLoG56nZOpoid7vrYp1gM3YAUH2Xlr5c2Zz8E0cAiyd2kXw8-4vDVwCB_MC0kvIogH49Jkm8QHrwXcq9JZJ4ejqMpa17xgcCrCE1WSrwQ0bjlXo8ocYUwwdgq1IVx3oD_EjtWpSlihbnz9YGq2_BJTSw3zfI93HjLk4IaRnbcv_-TC0IzXM5WDA',
    // محتوى المقال (يمكن أن يكون HTML)
    content: `
      <p class="lead">تشهد مصر تحولًا رقميًا سريعًا، ومع هذا التحول، يزداد الاهتمام بمفهوم المنازل الذكية. لم تعد فكرة المنزل الذي يتحكم في إضاءته وتكييفه وأجهزته بكبسة زر أو أمر صوتي مجرد خيال علمي، بل أصبحت واقعًا ملموسًا يتجه إليه الكثيرون.</p>
      
      <h3>ما هي المنازل الذكية؟</h3>
      <p>المنزل الذكي هو منزل مجهز بتقنيات تسمح بالتحكم الآلي في الأنظمة المنزلية المختلفة مثل الإضاءة، والتدفئة، والتهوية، وتكييف الهواء، والأمن، والأجهزة المنزلية. يمكن التحكم في هذه الأنظمة عن بعد عبر الهواتف الذكية أو الأجهزة اللوحية.</p>
      
      <h3>الاتجاهات الحالية في السوق المصري</h3>
      <ul>
        <li><strong>زيادة الوعي والطلب:</strong> مع انتشار الإنترنت فائق السرعة، أصبح المستهلك المصري أكثر إقبالًا على حلول المنازل الذكية.</li>
        <li><strong>تنوع المنتجات:</strong> شهد السوق دخول شركات عالمية ومحلية تقدم حلولاً متنوعة تناسب مختلف الميزانيات.</li>
        <li><strong>التركيز على الاستدامة:</strong> تعتبر الحلول الذكية وسيلة فعالة لترشيد استهلاك الطاقة.</li>
      </ul>

      <blockquote>"المنازل الذكية لم تعد ترفًا، بل استثمارًا في الراحة والأمان وكفاءة استهلاك الطاقة."</blockquote>

      <p>في الختام، يبدو مستقبل المنازل الذكية في مصر واعدًا ومشرقًا. مع استمرار التطور التكنولوجي وزيادة الوعي بفوائدها، من المتوقع أن تصبح جزءًا لا يتجزأ من المشهد العقاري.</p>
    `
  };

  // مقالات ذات صلة
  relatedPosts = [
    {
      id: 2,
      title: '5 نصائح لشراء شقتك الأولى في القاهرة الجديدة',
      excerpt: 'دليلك الكامل لاتخاذ قرار الشراء الصحيح وتجنب الأخطاء الشائعة.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByPT6DjlW02PghRvfNZtk3MsxWhBTrQVLs8T8lJzFImXneJpSuoYwYaVP7mhEc7wctsmqccwpBrFQT2WtJfs50uV7nVFged8emX6U_CvAejP3ZcT4jInpSyhTldYZaoaTTi5ZSzCQPQ6EB9pdY0PX_tFCYCPbtXM866kynK3bKMkuBF4fys_C2CozrNNDNomKOzbdIMEnptnU5fBZp2MX_tXSSizWpx6DxfKd7ArSiuM9aQtAJP7w65LaT6Yfu52UwsNmx8PuNAX0',
      date: '15 يوليو 2024'
    },
    {
      id: 3,
      title: 'الاستثمار العقاري في الساحل الشمالي',
      excerpt: 'تحليل شامل لسوق العقارات في الساحل والفرص المتاحة حالياً.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjTfY9N4N1oz0s9Y_kVKwicuoRa8aB4FDJsaYua2Z30DNRMBS2xQhTFJGPcffEOXPAVTaES43258YKIVC-easU55UzT6tSp1A_dPgIWBuTdq9VQDBM7SpDaabnKcl7yxfe4dMHZuNSch5gdm3Zt9FIjGrhPfdwv_makcBcbJ3VqR6o1YU5tc-ru4R8YC77rDQev3kOdoCuJwlW9bRHAAkevhPMpRTmt21HVYDBMZeZXxXqcn2ScvUIQKF6_kt7kkd8dlORp1VMqjY',
      date: '10 يوليو 2024'
    },
    {
      id: 4,
      title: 'أحدث اتجاهات التصميم الداخلي لعام 2024',
      excerpt: 'اجعل منزلك مواكبًا لأحدث صيحات الديكور العالمية بأفكار بسيطة.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNz66vNIMF9LD6g6Sj0yLvlTaiZlvODhXV1kAnzoSimuZjJ90DuyMkr6SPLP1FMNfdCqgd4Z1UBfBy6j-A7MhE2_10ZiSvxi8KQVfHZ4iTASZjkukHutCWWmyL4694aw_8bLuEwzaWI-hg-VIKn2SkIpWCf4RPW2i2L2aeljUND1oH__k60CAj6jmp_lGsfkxQyCugMr_Qcqkl_N20fdRVRv1feYLJdoJshpVklqOPPngDs6EJZIr9m-Svmb0OW6yp4UuhFpqtpfM',
      date: '05 يوليو 2024'
    }
  ];

  // السايدبار
  searchQuery = signal('');
  categories = [
    { name: 'نصائح الشراء', count: 12 },
    { name: 'أخبار السوق', count: 8 },
    { name: 'تصميم وديكور', count: 5 },
    { name: 'تكنولوجيا العقارات', count: 3 }
  ];
  
  popularPosts = [
    { id: 5, title: 'أفضل 5 مناطق للسكن في الشيخ زايد' },
    { id: 6, title: 'كيفية تقييم سعر العقار بشكل صحيح' },
    { id: 7, title: 'مستقبل العاصمة الإدارية الجديدة' },
    { id: 8, title: 'شراء عقار بالتقسيط: ما يجب أن تعرفه' }
  ];
}