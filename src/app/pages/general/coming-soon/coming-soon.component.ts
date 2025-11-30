import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-coming-soon',
  imports: [CommonModule, FormsModule],
  templateUrl: './coming-soon.component.html',
  styleUrl: './coming-soon.component.scss'
})
export class ComingSoonComponent implements OnInit, OnDestroy {
  email = signal('');
  isSubscribed = signal(false);
  
  // حالة العداد
  days = signal(0);
  hours = signal(0);
  minutes = signal(0);
  seconds = signal(0);

  private intervalId: any;
  // تاريخ الإطلاق (بعد 14 يوم من الآن كمثال)
  private targetDate = new Date().getTime() + (14 * 24 * 60 * 60 * 1000);

  ngOnInit() {
    this.startTimer();
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  startTimer() {
    this.intervalId = setInterval(() => {
      const now = new Date().getTime();
      const distance = this.targetDate - now;

      if (distance < 0) {
        clearInterval(this.intervalId);
        return;
      }

      this.days.set(Math.floor(distance / (1000 * 60 * 60 * 24)));
      this.hours.set(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
      this.minutes.set(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
      this.seconds.set(Math.floor((distance % (1000 * 60)) / 1000));
    }, 1000);
  }

  subscribe() {
    if (this.email()) {
      // محاكاة الاشتراك
      this.isSubscribed.set(true);
      setTimeout(() => {
        this.email.set('');
        this.isSubscribed.set(false);
      }, 3000);
    }
  }
}