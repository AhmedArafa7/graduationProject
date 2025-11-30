import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  private router = inject(Router);

  // UI States
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

  // Computed: Password Match Check
  passwordsMatch = computed(() => {
    return this.password() === this.confirmPassword();
  });

  // Actions
  setUserType(type: 'buyer' | 'agent') {
    this.userType.set(type);
  }

  togglePasswordVisibility() {
    this.isPasswordVisible.update(v => !v);
  }

  toggleConfirmPasswordVisibility() {
    this.isConfirmPasswordVisible.update(v => !v);
  }

  onSubmit(form: NgForm) {
    // تحقق إضافي للتطابق قبل الإرسال
    if (form.invalid || !this.passwordsMatch()) return;

    this.isSubmitting.set(true);

    setTimeout(() => {
      console.log('Signup Success:', {
        type: this.userType(),
        name: this.name(),
        email: this.email(),
        phone: this.phone()
      });
      
      this.isSubmitting.set(false);
      this.router.navigate(['/dashboard']);
    }, 1500);
  }
}