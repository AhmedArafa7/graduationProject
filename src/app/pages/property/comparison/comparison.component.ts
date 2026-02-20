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
}
