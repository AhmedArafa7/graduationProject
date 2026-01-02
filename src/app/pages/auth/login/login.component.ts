import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private router = inject(Router);
  private toast = inject(ToastService);

  // Form Signals
  email = signal('');
  password = signal('');
  rememberMe = signal(false);

  // UI States
  isPasswordVisible = signal(false);
  isSubmitting = signal(false);

  togglePasswordVisibility() {
    this.isPasswordVisible.update(v => !v);
  }

  onSubmit(form: any) {
    if (form.invalid) {
      this.toast.show('يرجى التأكد من صحة البيانات المدخلة', 'error');
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
      return;
    }

    // محاكاة الاتصال بالسيرفر
    this.isSubmitting.set(true);

    setTimeout(() => {
      this.isSubmitting.set(false);
      
      // هنا مفروض يكون في تحقق حقيقي من الباك إند
      // للمحاكاة سنعتبره ناجحاً
      this.toast.show('تم تسجيل الدخول بنجاح! مرحباً بك.', 'success');
      this.router.navigate(['/']); // التوجيه للرئيسية
    }, 1500);
  }

  socialLogin(provider: string) {
    this.toast.show(`جاري التحويل لصفحة تسجيل الدخول عبر ${provider}...`, 'info');
    // محاكاة توجيه خارجي
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 1000);
  }
}