import { Component, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';
import { ContactService } from '../../../core/services/contact.service';
import { ContactForm } from '../../../core/models/contact.model';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  private toast = inject(ToastService);
  private platformId = inject(PLATFORM_ID);
  private contactService = inject(ContactService);

  // Form Signals
  name = signal('');
  email = signal('');
  phone = signal('');
  subject = signal('general');
  message = signal('');
  agreeToPrivacy = signal(false);

  // UI States
  isSubmitting = signal(false);

  // منع كتابة الحروف نهائياً
  restrictToNumbers(event: any) {
    const input = event.target;
    // السماح فقط بالأرقام 0-9
    input.value = input.value.replace(/[^0-9]/g, '');
    this.phone.set(input.value);
  }

  onSubmit(form: NgForm) {
    // 1. التحقق من صلاحية النموذج
    if (form.invalid) {
      this.toast.show('توجد أخطاء في البيانات، يرجى مراجعة الحقول الحمراء', 'error');
      // إظهار رسائل الخطأ لجميع الحقول
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
      return;
    }

    // 2. التحقق من صحة الرقم المصري يدوياً لزيادة التأكيد
    const phonePattern = /^01[0125][0-9]{8}$/;
    if (!phonePattern.test(this.phone())) {
      this.toast.show('رقم الهاتف غير صحيح', 'error');
      return;
    }

    // 3. التحقق من الخصوصية
    if (!this.agreeToPrivacy()) {
      this.toast.show('يجب الموافقة على سياسة الخصوصية', 'error');
      return;
    }

    // إرسال الرسالة عبر الخدمة
    this.isSubmitting.set(true);
    
    const contactData: ContactForm = {
      name: this.name(),
      email: this.email(),
      phone: this.phone(),
      subject: this.subject(),
      message: this.message()
    };

    this.contactService.sendMessage(contactData).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toast.show('تم الإرسال بنجاح!', 'success');
        
        // تصفير النموذج
        form.resetForm();
        this.subject.set('general');
      },
      error: () => {
        this.isSubmitting.set(false);
        this.toast.show('حدث خطأ أثناء الإرسال، يرجى المحاولة لاحقاً', 'error');
      }
    });
  }

  openMap() {
    if (isPlatformBrowser(this.platformId)) {
      // رابط خرائط جوجل (القاهرة - الدقي)
      const url = 'https://www.google.com/maps/search/?api=1&query=Dokki,Cairo,Egypt';
      window.open(url, '_blank');
    }
  }
}