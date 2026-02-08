import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private router = inject(Router);

  // Signals
  email = signal('');
  code = signal('');
  newPassword = signal('');
  
  isSubmitting = signal(false);
  step = signal<1 | 2>(1); // Step 1: Email, Step 2: Code & New Password

  // URL API
  private apiUrl = 'http://localhost:3000/api/auth';

  onSubmitEmail() {
    if (!this.email()) {
      this.toast.show('يرجى إدخال البريد الإلكتروني', 'error');
      return;
    }

    this.isSubmitting.set(true);

    this.http.post(`${this.apiUrl}/forgot-password`, { email: this.email() }).subscribe({
      next: (res: any) => {
        this.isSubmitting.set(false);
        this.toast.show('تم إرسال رمز التحقق إلى بريدك الإلكتروني', 'success');
        this.step.set(2);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error(err);
        this.toast.show(err.error?.error || 'فشل إرسال البريد الإلكتروني', 'error');
      }
    });
  }

  onSubmitReset() {
    if (!this.code() || !this.newPassword()) {
      this.toast.show('يرجى إدخال الكود وكلمة المرور الجديدة', 'error');
      return;
    }

    this.isSubmitting.set(true);

    this.http.post(`${this.apiUrl}/reset-password`, { 
      email: this.email(),
      code: this.code(),
      newPassword: this.newPassword()
    }).subscribe({
      next: (res: any) => {
        this.isSubmitting.set(false);
        this.toast.show('تم تغيير كلمة المرور بنجاح! قم بتسجيل الدخول الآن.', 'success');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error(err);
        this.toast.show(err.error?.error || 'فشل تغيير كلمة المرور', 'error');
      }
    });
  }
}