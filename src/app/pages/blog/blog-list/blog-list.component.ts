import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BlogService } from '../../../core/services/blog.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-blog-list',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './blog-list.component.html',
  styleUrl: './blog-list.component.scss'
})
export class BlogListComponent implements OnInit {
  private blogService = inject(BlogService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Signals
  searchQuery = signal('');
  selectedCategory = signal('الكل');
  email = signal('');

  // Data
  allPosts = this.blogService.getAllPosts();
  categories = ['الكل', ...this.blogService.getCategories().map(c => c.name)];
  featuredPost = this.allPosts[0];
  popularPosts = [...this.allPosts].sort((a, b) => parseFloat(b.views) - parseFloat(a.views)).slice(0, 3);

  // Filtered List
  displayedPosts = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const cat = this.selectedCategory();

    return this.allPosts.filter(post => {
      // استثناء المقال المميز فقط إذا لم يكن هناك بحث أو فلتر
      if (post.id === this.featuredPost.id && !query && cat === 'الكل') return false;

      const matchesSearch = post.title.toLowerCase().includes(query) || post.excerpt.toLowerCase().includes(query);
      const matchesCat = cat === 'الكل' || post.category === cat;
      return matchesSearch && matchesCat;
    });
  });

  ngOnInit() {
    // قراءة التصنيف من الرابط (إذا تم الضغط عليه في صفحة التفاصيل)
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory.set(params['category']);
        // تنظيف الرابط حتى لا يبقى الفلتر معلقاً
        this.router.navigate([], { queryParams: { category: null }, queryParamsHandling: 'merge', replaceUrl: true });
      }
    });
  }

  setCategory(cat: string) {
    this.selectedCategory.set(cat);
  }

  subscribe() {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!this.email()) {
      this.toast.show('يرجى إدخال البريد الإلكتروني', 'error');
      return;
    }

    if (!emailPattern.test(this.email())) {
      this.toast.show('يرجى إدخال بريد إلكتروني صحيح', 'error');
      return;
    }

    this.toast.show('تم الاشتراك في النشرة البريدية بنجاح!', 'success');
    this.email.set('');
  }
}