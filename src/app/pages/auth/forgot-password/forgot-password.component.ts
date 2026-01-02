import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  private toast = inject(ToastService);

  // Signals
  email = signal('');
  isSubmitting = signal(false);
  isSent = signal(false);
  isResending = signal(false); // حالة لزر إعادة الإرسال

  onSubmit(form: any) {
    // 1. التحقق من صحة النموذج بالكامل
    if (form.invalid) {
      this.toast.show('يرجى إدخال بريد إلكتروني صحيح', 'error');
      // تعليم الحقل على أنه "تم لمسه" لإظهار رسالة الخطأ الحمراء
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
      return;
    }

    // 2. تحقق إضافي للتأكد (Regex)
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(this.email())) {
      this.toast.show('صيغة البريد الإلكتروني غير صحيحة', 'error');
      return;
    }

    this.isSubmitting.set(true);

    // محاكاة الإرسال
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.isSent.set(true);
      this.toast.show('تم إرسال رابط الاستعادة بنجاح!', 'success');
    }, 1500);
  }

  // دالة خاصة لزر إعادة الإرسال
  resendLink() {
    if (this.isResending()) return;

    this.isResending.set(true);
    
    // محاكاة إعادة الإرسال
    setTimeout(() => {
      this.isResending.set(false);
      this.toast.show('تم إعادة إرسال الرابط إلى بريدك.', 'success');
    }, 2000);
  }
}