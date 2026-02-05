import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GlobalStateService } from '../../../core/services/global-state.service';
import { UserService } from '../../../core/services/user.service';
import { AgentSidebarComponent } from '../../../shared/agent-sidebar/agent-sidebar.component';
import { ComparisonModalComponent } from '../../../shared/comparison-modal/comparison-modal.component';

@Component({
  selector: 'app-favorites',
  imports: [CommonModule, RouterLink, AgentSidebarComponent, ComparisonModalComponent],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss'
})
export class FavoritesComponent implements OnInit {
  private globalState = inject(GlobalStateService);
  private userService = inject(UserService);

  favorites = signal<any[]>([]);
  isLoading = signal(true);


  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    this.userService.getUserFavorites().subscribe({
      next: (data) => {
        this.favorites.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load favorites', err);
        this.isLoading.set(false);
      }
    });
  }

  favoritesCount = computed(() => this.favorites().length);

  // Comparison Logic
  selectedIds = signal<Set<string | number>>(new Set());
  
  toggleSelection(id: number | string, event: Event) {
    event.stopPropagation();
    const current = new Set(this.selectedIds());
    if (current.has(id)) {
      current.delete(id);
    } else {
      if (current.size >= 3) {
         alert('يمكنك مقارنة 3 عقارات فقط كحد أقصى حالياً');
         return;
      }
      current.add(id);
    }
    this.selectedIds.set(current);
  }

  // Modal State
  showComparisonModal = signal(false);

  selectedProperties = computed(() => {
    const ids = this.selectedIds();
    return this.favorites().filter(p => ids.has(p.id));
  });

  startComparison() {
    this.showComparisonModal.set(true);
  }

  closeComparison() {
    this.showComparisonModal.set(false);
  }

  removeFromFavorites(id: number | string) {
    this.globalState.toggleFavorite(id.toString());
  }
}
