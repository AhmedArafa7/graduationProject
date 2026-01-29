import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../../core/services/content.service';

@Component({
  selector: 'app-about',
  imports: [CommonModule, RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  private contentService = inject(ContentService);
  
  // قيم الشركة
  values = this.contentService.values;

  // إحصائيات
  stats = this.contentService.stats;

  // فريق العمل
  team = this.contentService.team;

  // شركاء النجاح
  partners = this.contentService.partners;
}