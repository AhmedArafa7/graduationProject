import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlogService } from '../../../core/services/blog.service';
import { BlogPost } from '../../../core/models/blog-post.model';
import { ToastService } from '../../../core/services/toast.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-blogs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-border-color dark:border-gray-700 p-6">
      
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-text-primary dark:text-white">إدارة المدونات</h2>
        <button (click)="openAddModal()" class="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors flex items-center gap-2">
          <span class="material-symbols-outlined">add</span> إضافة مقال جديد
        </button>
      </div>

      <!-- Blogs Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-right text-sm">
          <thead class="bg-gray-50 dark:bg-gray-700/50 text-text-secondary dark:text-gray-300">
            <tr>
              <th class="p-4 font-bold">الصورة</th>
              <th class="p-4 font-bold">العنوان</th>
              <th class="p-4 font-bold">التصنيف</th>
              <th class="p-4 font-bold">التاريخ</th>
              <th class="p-4 font-bold text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700 text-text-primary dark:text-white">
            @for (post of posts(); track post.id || post._id) {
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td class="p-4">
                  <img [src]="post.image || '/assets/images/user-placeholder.png'" class="w-16 h-12 object-cover rounded-lg" alt="">
                </td>
                <td class="p-4 font-bold">{{ post.title }}</td>
                <td class="p-4">{{ post.category }}</td>
                <td class="p-4 text-text-secondary">{{ post.date | date:'shortDate' }}</td>
                <td class="p-4 flex justify-center gap-2">
                  <button (click)="openEditModal(post)" class="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="تعديل">
                    <span class="material-symbols-outlined">edit</span>
                  </button>
                  <button (click)="deletePost(post.id || post._id)" class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="حذف">
                    <span class="material-symbols-outlined">delete</span>
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="p-8 text-center text-text-secondary">لا توجد مقالات حالياً.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      
      <!-- Modal Overlay -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div class="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center shrink-0">
              <h2 class="text-2xl font-bold text-text-primary dark:text-white">
                {{ editingPost() ? 'تعديل مقال' : 'إضافة مقال جديد' }}
              </h2>
              <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <div class="p-6 overflow-y-auto w-full">
              <form class="flex flex-col gap-4">
                <div>
                  <label class="block text-sm font-semibold mb-1 dark:text-gray-300">العنوان</label>
                  <input type="text" [(ngModel)]="formData.title" name="title" class="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white" placeholder="عنوان المقال">
                </div>
                <div>
                  <label class="block text-sm font-semibold mb-1 dark:text-gray-300">مقتطف (ملخص قصير)</label>
                  <textarea [(ngModel)]="formData.excerpt" name="excerpt" rows="2" class="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white" placeholder="مقدمة المقال"></textarea>
                </div>
                <div>
                  <label class="block text-sm font-semibold mb-1 dark:text-gray-300">المحتوى</label>
                  <textarea [(ngModel)]="formData.content" name="content" rows="5" class="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white" placeholder="اكتب المحتوى هنا..."></textarea>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold mb-1 dark:text-gray-300">التصنيف</label>
                    <input type="text" [(ngModel)]="formData.category" name="category" class="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white" placeholder="مثال: أخبار السوق">
                  </div>
                  <div>
                    <label class="block text-sm font-semibold mb-1 dark:text-gray-300">رابط صورة المقال</label>
                    <input type="text" [(ngModel)]="formData.image" name="image" class="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white" placeholder="https://...">
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold mb-1 dark:text-gray-300">اسم الكاتب</label>
                    <input type="text" [(ngModel)]="formData.author" name="author" class="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white" placeholder="كريم محمد">
                  </div>
                  <div>
                    <label class="block text-sm font-semibold mb-1 dark:text-gray-300">لقب الكاتب</label>
                    <input type="text" [(ngModel)]="formData.authorTitle" name="authorTitle" class="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white" placeholder="مستشار عقاري">
                  </div>
                </div>
              </form>
            </div>

            <div class="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 shrink-0">
              <button (click)="closeModal()" class="px-6 py-2 rounded-lg font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                إلغاء
              </button>
              <button (click)="savePost()" class="px-6 py-2 rounded-lg font-bold text-white bg-primary hover:bg-primary/90 transition-colors shadow-lg">
                حفظ المقال
              </button>
            </div>
            
          </div>
        </div>
      }

    </div>
  `
})
export class AdminBlogsComponent implements OnInit {
  private blogService = inject(BlogService);
  private toast = inject(ToastService);
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/posts`; // CMS acts directly with API for mutating

  posts = signal<any[]>([]);
  
  showModal = signal(false);
  editingPost = signal<string | null>(null);
  
  formData = {
    title: '',
    excerpt: '',
    content: '',
    category: '',
    image: '',
    author: '',
    authorTitle: '',
    views: '0',
    readTime: '3 دقائق'
  };

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    // using direct GET to ensure latest without caching layers for admin
    this.http.get<any[]>(this.apiUrl).subscribe(data => this.posts.set(data));
  }

  openAddModal() {
    this.resetForm();
    this.editingPost.set(null);
    this.showModal.set(true);
  }

  openEditModal(post: any) {
    this.editingPost.set(post._id || post.id);
    this.formData = { ...post };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.resetForm();
  }

  savePost() {
    if (!this.formData.title || !this.formData.excerpt) {
      this.toast.show('يرجى تعبئة الحقول الأساسية', 'error');
      return;
    }

    if (this.editingPost()) {
      // Update
      this.http.put(`${this.apiUrl}/${this.editingPost()}`, this.formData).subscribe({
        next: () => {
          this.toast.show('تم تحديث المقال بنجاح', 'success');
          this.loadPosts();
          this.closeModal();
          this.blogService.loadPosts(); // update public state
        },
        error: () => this.toast.show('حدث خطأ أثناء التحديث', 'error')
      });
    } else {
      // Add
      this.http.post(this.apiUrl, this.formData).subscribe({
        next: () => {
          this.toast.show('تمت إضافة المقال بنجاح', 'success');
          this.loadPosts();
          this.closeModal();
          this.blogService.loadPosts();
        },
        error: () => this.toast.show('حدث خطأ أثناء الإضافة', 'error')
      });
    }
  }

  deletePost(id: string) {
    if (confirm('هل أنت متأكد من حذف هذا المقال بصورة نهائية؟')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          this.toast.show('تم حذف المقال', 'success');
          this.loadPosts();
          this.blogService.loadPosts();
        },
        error: () => this.toast.show('خطأ في عملية الحذف', 'error')
      });
    }
  }

  resetForm() {
    this.formData = {
      title: '',
      excerpt: '',
      content: '',
      category: '',
      image: '',
      author: '',
      authorTitle: '',
      views: '0',
      readTime: '3 دقائق'
    };
  }
}
