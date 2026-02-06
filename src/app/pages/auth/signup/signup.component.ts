import { Component, signal, inject, computed, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';
import { UserService } from '../../../core/services/user.service';
import { NgxImageCompressService as ImageCompressService } from 'ngx-image-compress';

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

  private imageCompress = inject(ImageCompressService);

  // ... (existing code)

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        this.toast.show('يرجى اختيار ملف صورة صحيح', 'error');
        return;
      }
      
      // قراءة الملف وضغطه
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const image = e.target?.result as string;
        
        // ضغط الصورة: Ratio 50%, Quality 50% (تقليل الحجم للنصف تقريباً)
        this.imageCompress.compressFile(image, -1, 50, 50).then(
          (result: string) => {
            this.profileImage.set(result);
            
            // حساب حجم الصورة الجديدة للمقارنة (اختياري)
            const oldSize = (image.length * 3) / 4 / 1024;
            const newSize = (result.length * 3) / 4 / 1024;
            console.log(`Image compressed from ${oldSize.toFixed(2)}KB to ${newSize.toFixed(2)}KB`);
          }
        );
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

    // 4. التحقق من طول كلمة المرور (جديد للإنتاج)
    if (this.password().length < 6) {
      this.toast.show('كلمة المرور قصيرة جداً (6 أحرف على الأقل)', 'error');
      return;
    }

    // 5. التحقق من الشروط
    if (!this.agreeTerms()) {
      this.toast.show('يجب الموافقة على الشروط والأحكام', 'error');
      return;
    }

    this.isSubmitting.set(true);

    // تقسيم الاسم إلى أول وأخير
    const nameParts = this.name().trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // إرسال طلب التسجيل
    this.userService.registerUser({
      firstName,
      lastName,
      email: this.email(),
      phone: this.phone(),
      profileImage: this.profileImage(),
      userType: this.userType()
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toast.show('تم إنشاء الحساب بنجاح! جاري تحويلك...', 'success');
        this.router.navigate(['/profile']);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.toast.show('حدث خطأ أثناء التسجيل', 'error');
      }
    });
  }

  socialLogin(provider: string) {
    this.toast.show(`جاري التسجيل بواسطة ${provider}...`, 'info');
    // محاكاة توجيه خارجي
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 1000);
  }

}