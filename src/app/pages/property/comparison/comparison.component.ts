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
    let score = 4; // Base score
    const p = this.parseToNumber(prop.price);
    const a = this.parseToNumber(prop.area);
    const ppm = this.getPricePerSqm(prop.price, prop.area);
    
    // Area scoring
    if (a >= 100) score += 0.5;
    if (a >= 150) score += 0.5;
    if (a >= 200) score += 1;
    
    // Price per sqm scoring (lower is usually better value)
    if (ppm > 0) {
      if (ppm < 15000) score += 2;
      else if (ppm < 25000) score += 1;
      else if (ppm < 35000) score += 0.5;
    }
    
    // Features scoring
    if (prop.features) {
      if (prop.features.length >= 2) score += 0.5;
      if (prop.features.length >= 4) score += 0.5;
      if (prop.features.length >= 6) score += 1;
    }

    // Rooms scoring
    if (prop.bedrooms && prop.bedrooms >= 3) score += 0.5;
    if (prop.bathrooms && prop.bathrooms >= 2) score += 0.5;
    
    // Round to 1 decimal place
    return Math.min(Math.round(score * 10) / 10, 10);
  }

  getValueRating(price: any, area: any): string {
    const ppm = this.getPricePerSqm(price, area);
    if (ppm === 0) return 'غير محدد';
    if (ppm < 15000) return 'فرصة ممتازة';
    if (ppm < 30000) return 'سعر مناسب للخدمات';
    return 'قيمة استثمارية';
  }

  getEstimatedRentYield(price: any): string {
    const p = this.parseToNumber(price);
    if (!p) return 'غير محدد';
    // Mock yield 6-8%
    const yieldPercentage = 6 + (p % 3); // 6%, 7%, or 8% based on price
    const annualRent = (p * yieldPercentage) / 100;
    return `${yieldPercentage}% (حوالي ${annualRent.toLocaleString('en-US')} ج.م سنوياً)`;
  }

  getValueProjection(price: any): string {
    const p = this.parseToNumber(price);
    if (!p) return 'غير محدد';
    // Mock 5 year projection (inflation + demand = approx 40-60% over 5 years)
    const factor = 1.4 + ((p % 3) * 0.1); 
    const futureValue = p * factor;
    return `${Math.round(futureValue).toLocaleString('en-US')} ج.م (بعد 5 سنوات)`;
  }
}
