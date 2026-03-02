import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { TestimonialsService } from '../../../core/services/testimonials.service';

@Component({
  selector: 'app-admin-testimonials',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-border-color dark:border-gray-700 p-6">
      
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-text-primary dark:text-white">إدارة آراء العملاء</h2>
        <button (click)="openAddModal()" class="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors flex items-center gap-2">
          <span class="material-symbols-outlined">add</span> إضافة رأي جديد
        </button>
      </div>

      <!-- Testimonials Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-right text-sm">
          <thead class="bg-gray-50 dark:bg-gray-700/50 text-text-secondary dark:text-gray-300">
            <tr>
              <th class="p-4 font-bold">العميل</th>
              <th class="p-4 font-bold">الصفة</th>
              <th class="p-4 font-bold">التقييم</th>
              <th class="p-4 font-bold">النص</th>
              <th class="p-4 font-bold">التاريخ</th>
              <th class="p-4 font-bold text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700 text-text-primary dark:text-white">
            @for (item of testimonials(); track item.id || item._id) {
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td class="p-4 flex items-center gap-3">
                  <img [src]="item.image || '/assets/images/user-placeholder.png'" class="w-10 h-10 rounded-full object-cover" alt="">
                  <span class="font-bold">{{ item.name }}</span>
                </td>
                <td class="p-4">{{ item.role }}</td>
                <td class="p-4 text-yellow-500 font-bold">{{ item.rating }} ★</td>
                <td class="p-4 max-w-xs truncate" [title]="item.text">{{ item.text }}</td>
                <td class="p-4 text-text-secondary">{{ item.date | date:'shortDate' }}</td>
                <td class="p-4 flex justify-center gap-2">
                  <button (click)="openEditModal(item)" class="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="تعديل">
                    <span class="material-symbols-outlined">edit</span>
                  </button>
                  <button (click)="deleteItem(item.id || item._id)" class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="حذف">
                    <span class="material-symbols-outlined">delete</span>
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="p-8 text-center text-text-secondary">لا توجد آراء مسجلة حالياً.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      
      <!-- Modal Overlay -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            <div class="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center shrink-0">
              <h2 class="text-2xl font-bold text-text-primary dark:text-white">
                {{ editingItem() ? 'تعديل رأي العميل' : 'إضافة رأي جديد' }}
              </h2>
              <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <div class="p-6 overflow-y-auto w-full">
              <form class="flex flex-col gap-4">
                <div>
                  <label class="block text-sm font-semibold mb-1 dark:text-gray-300">اسم العميل</label>
                  <input type="text" [(ngModel)]="formData.name" name="name" class="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white" placeholder="مثال: أحمد محمود">
                </div>
                <div>
                  <label class="block text-sm font-semibold mb-1 dark:text-gray-300">صفة العميل (الدور)</label>
                  <input type="text" [(ngModel)]="formData.role" name="role" class="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white" placeholder="مثال: مشتري أو مستثمر">
                </div>
                <div>
                  <label class="block text-sm font-semibold mb-1 dark:text-gray-300">نص الرأي</label>
                  <textarea [(ngModel)]="formData.text" name="text" rows="4" class="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white" placeholder="اكتب الرأي هنا..."></textarea>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold mb-1 dark:text-gray-300">التقييم (1-5)</label>
                    <input type="number" min="1" max="5" step="0.5" [(ngModel)]="formData.rating" name="rating" class="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white" placeholder="5">
                  </div>
                  <div>
                    <label class="block text-sm font-semibold mb-1 dark:text-gray-300">رابط الصورة (اختياري)</label>
                    <input type="text" [(ngModel)]="formData.image" name="image" class="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white" placeholder="https://...">
                  </div>
                </div>
              </form>
            </div>

            <div class="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 shrink-0">
              <button (click)="closeModal()" class="px-6 py-2 rounded-lg font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                إلغاء
              </button>
              <button (click)="saveItem()" class="px-6 py-2 rounded-lg font-bold text-white bg-primary hover:bg-primary/90 transition-colors shadow-lg">
                حفظ 
              </button>
            </div>
            
          </div>
        </div>
      }

    </div>
  `
})
export class AdminTestimonialsComponent implements OnInit {
  private testimonialService = inject(TestimonialsService);
  private toast = inject(ToastService);
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/testimonials`; 

  testimonials = signal<any[]>([]);
  
  showModal = signal(false);
  editingItem = signal<string | null>(null);
  
  formData = {
    name: '',
    role: '',
    text: '',
    rating: 5,
    image: ''
  };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.http.get<any[]>(this.apiUrl).subscribe(data => this.testimonials.set(data));
  }

  openAddModal() {
    this.resetForm();
    this.editingItem.set(null);
    this.showModal.set(true);
  }

  openEditModal(item: any) {
    this.editingItem.set(item._id || item.id);
    this.formData = { ...item };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.resetForm();
  }

  saveItem() {
    if (!this.formData.name || !this.formData.text) {
      this.toast.show('يرجى تعبئة الحقول الأساسية', 'error');
      return;
    }

    if (this.editingItem()) {
      this.http.put(`${this.apiUrl}/${this.editingItem()}`, this.formData).subscribe({
        next: () => {
          this.toast.show('تم التحديث بنجاح', 'success');
          this.loadData();
          this.closeModal();
          this.testimonialService.loadTestimonials(); // update public state
        },
        error: () => this.toast.show('حدث خطأ أثناء التحديث', 'error')
      });
    } else {
       this.http.post(this.apiUrl, this.formData).subscribe({
        next: () => {
          this.toast.show('تمت الإضافة بنجاح', 'success');
          this.loadData();
          this.closeModal();
          this.testimonialService.loadTestimonials();
        },
        error: () => this.toast.show('حدث خطأ أثناء الإضافة', 'error')
      });
    }
  }

  deleteItem(id: string) {
    if (confirm('هل أنت متأكد من حذف هذا الرأي بصورة نهائية؟')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          this.toast.show('تم الحذف', 'success');
          this.loadData();
          this.testimonialService.loadTestimonials();
        },
        error: () => this.toast.show('خطأ في عملية الحذف', 'error')
      });
    }
  }

  resetForm() {
    this.formData = {
      name: '',
      role: '',
      text: '',
      rating: 5,
      image: ''
    };
  }
}
