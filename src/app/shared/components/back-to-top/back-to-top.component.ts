import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-back-to-top',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      (click)="scrollToTop()"
      [class.opacity-100]="isVisible()"
      [class.opacity-0]="!isVisible()"
      [class.pointer-events-none]="!isVisible()"
      class="fixed bottom-6 left-6 z-50 p-3 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
      aria-label="العودة للأعلى">
      <span class="material-symbols-outlined text-2xl">arrow_upward</span>
    </button>
  `
})
export class BackToTopComponent {
  isVisible = signal(false);

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isVisible.set(window.scrollY > 300);
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
