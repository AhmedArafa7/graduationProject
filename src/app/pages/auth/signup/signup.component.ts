import { Component, signal, inject, computed, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  private router = inject(Router);
  private toast = inject(ToastService);
  private userService = inject(UserService);
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
  profileImage = signal<string | null>(null);

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

  // اختيار صورة الملف الشخصي
  triggerFileInput(fileInput: HTMLInputElement) {
    fileInput.click();
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        this.toast.show('يرجى اختيار ملف صورة صحيح', 'error');
        return;
      }
      
      // التحقق من حجم الملف (الحد الأقصى 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.toast.show('حجم الصورة يجب أن يكون أقل من 5 ميجابايت', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.profileImage.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.profileImage.set(null);
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
      
      // تقسيم الاسم إلى أول وأخير
      const nameParts = this.name().trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // حفظ بيانات المستخدم في الـ UserService
      this.userService.registerUser({
        firstName,
        lastName,
        email: this.email(),
        phone: this.phone(),
        profileImage: this.profileImage(),
        userType: this.userType()
      });
      
      this.toast.show('تم إنشاء الحساب بنجاح! جاري تحويلك...', 'success');
      this.router.navigate(['/profile']);
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