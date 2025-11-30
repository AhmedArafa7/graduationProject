import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule, NgForm, NgModel } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private router = inject(Router);

  // State signals
  isPasswordVisible = signal(false);
  isSubmitting = signal(false);
  showEmailError = signal(false);
  showPasswordError = signal(false);
  emailTouched = signal(false);
  passwordTouched = signal(false);

  // Form data signals
  email = signal('');
  password = signal('');
  rememberMe = signal(false);

  // Password strength
  passwordStrength = signal(0);

  // Toggle password visibility
  togglePasswordVisibility() {
    this.isPasswordVisible.update(v => !v);
  }

  // Get input classes based on state
  getInputClasses(control: NgModel, field: string): string {
    const baseClasses = 'w-full h-12 px-4 rounded-lg border bg-white dark:bg-gray-800 text-text-primary dark:text-white transition-all placeholder:text-gray-400 focus:ring-2 focus:outline-none';
    
    if (control.invalid && (control.dirty || control.touched)) {
      return `${baseClasses} border-red-500 focus:ring-red-500 focus:border-red-500`;
    }
    
    if (control.valid && control.dirty) {
      return `${baseClasses} border-green-500 focus:ring-green-500 focus:border-green-500`;
    }
    
    return `${baseClasses} border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary/50`;
  }

  // Email blur handler
  onEmailBlur() {
    this.emailTouched.set(true);
    this.showEmailError.set(this.emailTouched() && !!this.email());
  }

  // Password input handler
  onPasswordInput() {
    this.calculatePasswordStrength();
    this.passwordTouched.set(true);
    this.showPasswordError.set(this.passwordTouched() && !!this.password());
  }

  // Calculate password strength
  calculatePasswordStrength() {
    const password = this.password();
    let strength = 0;

    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 10;

    this.passwordStrength.set(Math.min(strength, 100));
  }

  // Get password strength percentage
  getPasswordStrength(): number {
    return this.passwordStrength();
  }

  // Get password strength text
  getPasswordStrengthText(): string {
    const strength = this.passwordStrength();
    if (strength < 30) return 'ضعيفة';
    if (strength < 60) return 'متوسطة';
    if (strength < 80) return 'جيدة';
    return 'قوية';
  }

  // Get password strength class
  getPasswordStrengthClass(): string {
    const strength = this.passwordStrength();
    if (strength < 30) return 'text-red-500';
    if (strength < 60) return 'text-yellow-500';
    if (strength < 80) return 'text-blue-500';
    return 'text-green-500';
  }

  // Get password strength bar class
  getPasswordStrengthBarClass(): string {
    const strength = this.passwordStrength();
    if (strength < 30) return 'bg-red-500';
    if (strength < 60) return 'bg-yellow-500';
    if (strength < 80) return 'bg-blue-500';
    return 'bg-green-500';
  }

  // Social login methods
  loginWithGoogle() {
    if (this.isSubmitting()) return;
    
    this.isSubmitting.set(true);
    console.log('جاري تسجيل الدخول باستخدام Google...');
    
    // Simulate API call
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.router.navigate(['/dashboard']);
    }, 1500);
  }

  loginWithFacebook() {
    if (this.isSubmitting()) return;
    
    this.isSubmitting.set(true);
    console.log('جاري تسجيل الدخول باستخدام Facebook...');
    
    // Simulate API call
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.router.navigate(['/dashboard']);
    }, 1500);
  }

  // Form submission
  async onSubmit(form: NgForm) {
    if (form.invalid) {
      this.markAllFieldsTouched(form);
      return;
    }

    this.isSubmitting.set(true);

    try {
      // Simulate API call
      await this.simulateLogin();
      
      console.log('تم تسجيل الدخول بنجاح:', {
        email: this.email(),
        rememberMe: this.rememberMe()
      });
      
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('فشل تسجيل الدخول:', error);
      this.handleLoginError(error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  // Simulate login API call
  private simulateLogin(): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate random success/failure for demo
        const isSuccess = Math.random() > 0.2; // 80% success rate
        
        if (isSuccess) {
          resolve();
        } else {
          reject(new Error('فشل تسجيل الدخول. يرجى التحقق من البيانات والمحاولة مرة أخرى.'));
        }
      }, 2000);
    });
  }

  // Handle login errors
  private handleLoginError(error: any) {
    // In a real app, you would handle specific error types from your API
    this.showEmailError.set(true);
    this.showPasswordError.set(true);
    
    // You could set specific errors on the form controls here
    console.error('Login error:', error);
  }

  // Mark all form fields as touched
  private markAllFieldsTouched(form: NgForm) {
    Object.keys(form.controls).forEach(key => {
      const control = form.controls[key];
      control.markAsTouched();
    });
    
    this.showEmailError.set(true);
    this.showPasswordError.set(true);
  }
}