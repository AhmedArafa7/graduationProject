import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ComparisonService } from '../../../core/services/comparison.service';

@Component({
  selector: 'app-comparison',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './comparison.component.html',
  styleUrl: './comparison.component.scss'
})
export class ComparisonComponent {
  private comparisonService = inject(ComparisonService);
  
  // Expose the signal from the service
  properties = this.comparisonService.compareList;

  removeProperty(id: string) {
    this.comparisonService.removeFromCompare(id);
  }

  clearComparison() {
    this.comparisonService.clearCompare();
  }

  // --- Smart Comparison Features ---

  parseToNumber(value: any): number {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    const strVal = value.toString().replace(/,/g, '');
    return parseFloat(strVal) || 0;
  }

  getPricePerSqm(price: any, area: any): number {
    const p = this.parseToNumber(price);
    const a = this.parseToNumber(area);
    if (!p || !a) return 0;
    return Math.round(p / a);
  }

  getOverallScore(prop: any): number {
    // Simple mock logic for a "Score" out of 10
    // Higher area = (+), lower price = (+)
    // Number of amenities = (+)
    let score = 5; // Base score
    const p = this.parseToNumber(prop.price);
    const a = this.parseToNumber(prop.area);
    
    if (a > 150) score += 1;
    if (a > 250) score += 1;
    
    // Price relative scoring (mock logic)
    if (p > 0 && p < 1000000) score += 1;
    
    if (prop.features && prop.features.length > 3) score += 1;
    if (prop.features && prop.features.length > 6) score += 1;
    
    return Math.min(score, 10);
  }

  getValueRating(price: any, area: any): string {
    const ppm = this.getPricePerSqm(price, area);
    if (ppm === 0) return 'غير محدد';
    if (ppm < 15000) return 'فرصة ممتازة';
    if (ppm < 30000) return 'سعر مناسب للخدمات';
    return 'قيمة استثمارية';
  }
}
