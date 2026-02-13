import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';
import { UserService } from '../../../core/services/user.service';

import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  // ... imports
  private router = inject(Router);
  private toast = inject(ToastService);
  private apiUrl = `${environment.apiUrl}/auth`; 
  private userService = inject(UserService);

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

  onSubmit(form: NgForm) {
    if (form.invalid) {
      this.toast.show('يرجى التأكد من صحة البيانات المدخلة', 'error');
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
      return;
    }

    this.isSubmitting.set(true);

    const credentials = {
      email: this.email(),
      password: this.password()
    };

    this.userService.login(credentials).subscribe({
      next: (user: any) => {
        this.isSubmitting.set(false);
        this.toast.show(`تم تسجيل الدخول بنجاح! مرحباً ${user.firstName}`, 'success');
        this.router.navigate(['/']);
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        const errorMessage = err.error?.error || 'حدث خطأ أثناء تسجيل الدخول';
        this.toast.show(errorMessage, 'error');
      }
    });
  }

  socialLogin(provider: string) {
    this.toast.show(`جاري التحويل لصفحة تسجيل الدخول عبر ${provider}...`, 'info');
    // محاكاة تسجيل الدخول وتحديث الحالة
    setTimeout(() => {
      this.userService.mockSocialLogin(provider);
      this.router.navigate(['/']);
    }, 1000);
  }
}