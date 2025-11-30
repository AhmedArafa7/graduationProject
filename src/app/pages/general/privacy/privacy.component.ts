import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-privacy',
  imports: [CommonModule, RouterLink], // لا نحتاج Forms هنا
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.scss'
})
export class PrivacyComponent {
  lastUpdated = signal('24 أكتوبر 2024');

  // للتعامل مع التمرير السلس (Smooth Scroll) للروابط الداخلية
  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}