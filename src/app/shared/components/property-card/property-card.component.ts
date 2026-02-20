import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Property } from '../../../core/models/property.model'; // Adjust path if needed
import { ImageFallbackDirective } from '../../directives/image-fallback.directive';
import { FavoritesService } from '../../../core/services/favorites.service'; // Adjust path
import { ComparisonService } from '../../../core/services/comparison.service'; // Adjust path

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [CommonModule, RouterLink, ImageFallbackDirective],
  templateUrl: './property-card.component.html',
  styleUrls: ['./property-card.component.scss']
})
export class PropertyCardComponent {
  @Input({ required: true }) property!: any; // Using any for flexibility or strict Property type
  @Input() showCompare = true;

  private favoritesService = inject(FavoritesService);
  private comparisonService = inject(ComparisonService);

  isFavorite = computed(() => this.favoritesService.isFavorite(this.property.id || this.property._id));
  isInCompare = computed(() => this.comparisonService.isInCompare(this.property.id || this.property._id));

  toggleFavorite(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.favoritesService.toggleFavorite(this.property.id || this.property._id);
  }

  toggleCompare(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    if (this.isInCompare()) {
      this.comparisonService.removeFromCompare(this.property.id || this.property._id);
    } else {
      this.comparisonService.addToCompare(this.property);
    }
  }
}
