import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface SearchHistoryItem {
  id: string;
  type: 'text' | 'image';
  query?: string;
  imageData?: string; // Base64 compressed image
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class SearchHistoryService {
  private readonly MAX_TEXT_HISTORY = 200;
  private readonly MAX_IMAGE_HISTORY = 20;
  private readonly STORAGE_KEY = 'baytology_search_history';

  private platformId = inject(PLATFORM_ID);
  
  // Core state Signal
  private historyState = signal<SearchHistoryItem[]>([]);
  
  // Computed signals
  history = computed(() => this.historyState());

  constructor() {
    this.loadHistory();
  }

  private loadHistory() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as SearchHistoryItem[];
          this.historyState.set(parsed);
        }
      } catch (e) {
        console.error('Failed to parse search history', e);
        this.historyState.set([]);
      }
    }
  }

  private saveHistory(items: SearchHistoryItem[]) {
    this.historyState.set(items);
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save search history (might be quota exceeded)', e);
        // If quota exceeded, try cleaning up older items aggressively
        this.cleanupHistoryAggressively(items);
      }
    }
  }

  private cleanupHistoryAggressively(currentItems: SearchHistoryItem[]) {
     // Remove half of the images to free space
     const texts = currentItems.filter(i => i.type === 'text');
     const images = currentItems.filter(i => i.type === 'image');
     const reducedImages = images.slice(0, Math.floor(images.length / 2));
     const newItems = [...reducedImages, ...texts]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
     
     this.historyState.set(newItems);
     if (isPlatformBrowser(this.platformId)) {
        try {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newItems));
        } catch(e) {
           console.error('Aggressive cleanup failed, clearing all images');
           this.clearImageHistory();
        }
     }
  }

  addTextSearch(query: string) {
    if (!query || !query.trim()) return;
    const trimmedQuery = query.trim();

    const current = this.historyState();
    
    // Remove if already exists (to move it to top)
    let filtered = current.filter(item => item.type !== 'text' || item.query !== trimmedQuery);
    
    const newItem: SearchHistoryItem = {
      id: `text_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type: 'text',
      query: trimmedQuery,
      timestamp: new Date().toISOString()
    };

    filtered.unshift(newItem);

    // Enforce limits
    const textItems = filtered.filter(i => i.type === 'text');
    const imageItems = filtered.filter(i => i.type === 'image');

    const limitedTexts = textItems.slice(0, this.MAX_TEXT_HISTORY);
    
    // Recombine and sort
    const finalItems = [...limitedTexts, ...imageItems]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    this.saveHistory(finalItems);
  }

  addImageSearch(base64Image: string) {
    if (!base64Image) return;

    const current = this.historyState();
    
    // Optional: Filter identical images if needed, but hashing base64 is slow.
    // Assuming each upload is new.

    const newItem: SearchHistoryItem = {
      id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type: 'image',
      imageData: base64Image,
      timestamp: new Date().toISOString()
    };

    const newArr = [newItem, ...current];

    // Enforce limits
    const textItems = newArr.filter(i => i.type === 'text');
    const imageItems = newArr.filter(i => i.type === 'image');

    const limitedImages = imageItems.slice(0, this.MAX_IMAGE_HISTORY);
    
    const finalItems = [...limitedImages, ...textItems]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    this.saveHistory(finalItems);
  }

  removeSearch(id: string) {
    const current = this.historyState();
    const updated = current.filter(item => item.id !== id);
    this.saveHistory(updated);
  }

  clearAllHistory() {
    this.saveHistory([]);
  }

  clearImageHistory() {
    const textsOnly = this.historyState().filter(i => i.type === 'text');
    this.saveHistory(textsOnly);
  }
}
