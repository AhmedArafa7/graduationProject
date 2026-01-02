import { Component, signal, inject, computed, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  private router = inject(Router);
  private toast = inject(ToastService);
  private platformId = inject(PLATFORM_ID); // لدعم SSR

  // States
  userType = signal<'buyer' | 'agent'>('buyer');
  isPasswordVisible = signal(false);
  isConfirmPasswordVisible = signal(false);
  isSubmitting = signal(false);

  // Form Data
  name = signal('');
  email = signal('');
  phone = signal('');
  password = signal('');
  confirmPassword = signal('');
  agreeTerms = signal(false);
  newsletter = signal(false);

  // التحقق من تطابق الباسورد
  passwordsMatch = computed(() => this.password() === this.confirmPassword());

  setUserType(type: 'buyer' | 'agent') {
    this.userType.set(type);
  }

  togglePasswordVisibility() {
    this.isPasswordVisible.update(v => !v);
  }

  toggleConfirmPasswordVisibility() {
    this.isConfirmPasswordVisible.update(v => !v);
  }

  // دالة منع الحروف (تقبل الأرقام فقط)
  restrictToNumbers(event: any) {
    const input = event.target;
    input.value = input.value.replace(/[^0-9]/g, '');
    this.phone.set(input.value);
  }

  onSubmit(form: any) {
    // 1. التحقق العام
    if (form.invalid) {
      this.toast.show('يرجى مراجعة الحقول ذات الإطار الأحمر', 'error');
      Object.keys(form.controls).forEach(key => form.controls[key].markAsTouched());
      return;
    }

    // 2. التحقق من رقم الهاتف المصري
    const phonePattern = /^01[0125][0-9]{8}$/;
    if (!phonePattern.test(this.phone())) {
      this.toast.show('رقم الهاتف غير صحيح (يجب أن يكون 11 رقم ويبدأ بـ 01)', 'error');
      return;
    }

    // 3. التحقق من تطابق كلمة المرور
    if (!this.passwordsMatch()) {
      this.toast.show('كلمات المرور غير متطابقة', 'error');
      return;
    }

    // 4. التحقق من الشروط
    if (!this.agreeTerms()) {
      this.toast.show('يجب الموافقة على الشروط والأحكام', 'error');
      return;
    }

    this.isSubmitting.set(true);

    // محاكاة الاتصال بالسيرفر
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.toast.show('تم إنشاء الحساب بنجاح! جاري تحويلك...', 'success');
      this.router.navigate(['/auth/login']);
    }, 1500);
  }

  socialLogin(provider: string) {
    this.toast.show(`جاري التسجيل بواسطة ${provider}...`, 'info');
    // محاكاة توجيه خارجي
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 1000);
  }

}