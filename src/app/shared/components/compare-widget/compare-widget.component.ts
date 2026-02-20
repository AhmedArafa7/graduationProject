import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ComparisonService } from '../../../core/services/comparison.service';

@Component({
  selector: 'app-compare-widget',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (count() > 0) {
      <div class="fixed bottom-6 right-6 z-50 animate-bounce-in">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-primary/20 p-4 flex flex-col gap-3 min-w-[200px]">
          <div class="flex items-center justify-between">
            <span class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">compare_arrows</span>
              مقارنة ({{count()}})
            </span>
            <button (click)="clear()" class="text-xs text-red-500 hover:text-red-700 font-medium">مسح</button>
          </div>
          
          <div class="flex gap-2">
            @for (img of images(); track $index) {
              <img [src]="img" class="w-8 h-8 rounded-full border border-gray-200 object-cover">
            }
          </div>

          <a routerLink="/compare" class="w-full py-2 bg-primary text-white text-center rounded-xl font-bold hover:bg-primary/90 transition-colors text-sm shadow-lg shadow-primary/20">
            بدء المقارنة
          </a>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes bounceIn {
      0% { transform: scale(0.8); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    .animate-bounce-in {
      animation: bounceIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
  `]
})
export class CompareWidgetComponent {
  private comparisonService = inject(ComparisonService);

  count = computed(() => this.comparisonService.compareList().length);
  images = computed(() => this.comparisonService.compareList().map(p => p.image || p.coverImage || 'assets/images/placeholder.jpg').slice(0, 3));

  clear() {
    this.comparisonService.clearCompare();
  }
}
