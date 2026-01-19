import { Component, signal, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BlogService, BlogPost } from '../../../core/services/blog.service';
import { ToastService } from '../../../core/services/toast.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-blog-details',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './blog-details.component.html',
  styleUrl: './blog-details.component.scss'
})
export class BlogDetailsComponent implements OnInit {
  // ... (Injections كما هي)
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private blogService = inject(BlogService);
  private toast = inject(ToastService);
  private titleService = inject(Title);
  private platformId = inject(PLATFORM_ID);

  // States
  article = signal<BlogPost | undefined>(undefined);
  relatedPosts = signal<BlogPost[]>([]);
  searchQuery = signal(''); 

  // Sidebar Data
  // يجب أن تتطابق الأسماء هنا مع الأسماء في BlogList لتفعيل الفلتر بشكل صحيح
  categories = [
    { name: 'نصائح للبائعين', count: 12 },
    { name: 'أخبار السوق', count: 8 },
    { name: 'تصميم وديكور', count: 5 }, // تأكد أن هذا التصنيف موجود في القائمة الرئيسية أو قم بتوحيد الأسماء
    { name: 'تكنولوجيا العقارات', count: 3 }
  ];
  
  popularPosts = this.blogService.getAllPosts().slice(0, 3);

  // ... (ngOnInit & loadPost كما هي)
  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = Number(params['slug']); 
      if (!isNaN(id)) this.loadPost(id);
    });
  }

  loadPost(id: number) {
    const post = this.blogService.getPostById(id);
    if (post) {
      this.article.set(post);
      this.relatedPosts.set(this.blogService.getRelatedPosts(id));
      this.titleService.setTitle(`${post.title} - مدونة Baytology`);
      if (isPlatformBrowser(this.platformId)) window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.router.navigate(['/blog']);
    }
  }

  sharePost() {
    if (isPlatformBrowser(this.platformId)) {
      navigator.clipboard.writeText(window.location.href);
      this.toast.show('تم نسخ رابط المقال للمشاركة', 'success');
    }
  }

  // دالة الإرسال الجديدة
  sendPost() {
    if (isPlatformBrowser(this.platformId)) {
      const subject = encodeURIComponent(this.article()?.title || 'مقال مميز من Baytology');
      const body = encodeURIComponent(`شاهد هذا المقال المميز:\n\n${window.location.href}`);
      // فتح تطبيق البريد الافتراضي
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }
  }
}