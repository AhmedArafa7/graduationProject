import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  // بيانات النموذج (Plain Object for ngModel)
  formData = {
    name: '',
    email: '',
    phone: '',
    subject: 'general',
    message: '',
    agreeToPrivacy: false
  };

  // حالات التحميل والإرسال (Signals for UI)
  isSubmitting = signal(false);
  isSent = signal(false);

  onSubmit() {
    if (!this.formData.agreeToPrivacy) {
      alert('يرجى الموافقة على سياسة الخصوصية أولاً.');
      return;
    }

    this.isSubmitting.set(true);

    // محاكاة إرسال البيانات للسيرفر
    setTimeout(() => {
      console.log('Contact Form Data:', this.formData);
      
      this.isSubmitting.set(false);
      this.isSent.set(true);
      
      // إعادة تعيين النموذج بعد 3 ثواني وإخفاء رسالة النجاح
      setTimeout(() => {
        this.isSent.set(false);
        // Reset form data
        this.formData = {
          name: '',
          email: '',
          phone: '',
          subject: 'general',
          message: '',
          agreeToPrivacy: false
        };
      }, 3000);
    }, 1500);
  }
}