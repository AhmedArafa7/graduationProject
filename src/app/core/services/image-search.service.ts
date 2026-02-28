import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom, lastValueFrom, throwError, of, timer } from 'rxjs';
import { catchError, retry, delayWhen, filter, map } from 'rxjs/operators';
import { ToastService } from './toast.service';
import { SearchHistoryService } from './search-history.service';

export interface ImageSearchResult {
    matches: any[];
    aiAnalysis?: string;
    confidence?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ImageSearchService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private history = inject(SearchHistoryService);
  
  // Update with actual backend endpoint or read from environment
  private readonly API_URL = environment.speechToTextApiUrl ? environment.speechToTextApiUrl.replace('speech-to-text', 'image-search') : `${environment.apiUrl}/search/image`;

  isProcessing = signal(false);
  uploadProgress = signal(0);
  
  // Expose error state for UI
  uploadError = signal<string | null>(null);

  /**
   * Processes a File object, compresses it, saves to history, and sends to backend in chunks.
   */
  async processAndSearchImage(file: File): Promise<ImageSearchResult | null> {
    this.isProcessing.set(true);
    this.uploadProgress.set(0);
    this.uploadError.set(null);

    try {
      // 1. Compress Image
      const compressedBase64 = await this.compressImage(file);
      
      // 2. Save to history independently
      this.history.addImageSearch(compressedBase64);

      // 3. Upload with retry logic
      const result = await this.uploadImageChunkedWithRetry(compressedBase64);
      
      this.isProcessing.set(false);
      return result;

    } catch (err) {
      this.isProcessing.set(false);
      const msg = err instanceof Error ? err.message : 'فشل البحث بالصورة';
      this.uploadError.set(msg);
      this.toast.show(msg, 'error');
      return null;
    }
  }

  /**
   * Uses Canvas to resize and compress the image to a base64 Data URL.
   * Target: width <= 800px, quality 0.7 JPEG.
   */
  private compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas ctx is null'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = (e) => reject(e);
      };
      reader.onerror = (e) => reject(e);
    });
  }

  /**
   * Simulates a chunked upload or robust single upload with Progress tracking and exponential backoff retry.
   */
  private uploadImageChunkedWithRetry(base64Image: string): Promise<ImageSearchResult> {
    // In a real scenario, you can slice the base64 string and send it in chunks.
    // Here we use Angular's reportProgress to track the upload of the payload.
    const body = { image: base64Image };
    
    // Add custom header to bypass global interceptor toast if we handle it here
    const req = new HttpRequest('POST', this.API_URL, body, {
      reportProgress: true
    });

    const maxRetries = 3;

    const request$ = this.http.request<ImageSearchResult>(req).pipe(
      map((event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress) {
          const percentDone = Math.round(100 * event.loaded / (event.total || 1));
           this.uploadProgress.set(percentDone);
        } else if (event.type === HttpEventType.Response) {
           return event.body;
        }
        return null;
      }),
      filter(res => res !== null), // Only emit the final response
      retry({
        count: maxRetries,
        delay: (error, retryCount) => {
          this.toast.show(`الاتصال ضعيف، إعادة المحاولة (${retryCount}/${maxRetries})...`, 'error');
          return timer(Math.pow(2, retryCount) * 1000); // 2s, 4s, 8s
        }
      })
    );

    // If API URL is an empty placeholder, mock the response for demo purposes
    if (!environment.speechToTextApiUrl && !environment.apiUrl.includes('production')) {
      return this.mockImageUploadAndProcessing(base64Image);
    }

    return lastValueFrom(request$) as Promise<ImageSearchResult>;
  }

  /**
   * Mock processing for development since endpoints might not be ready.
   */
  private async mockImageUploadAndProcessing(base64: string): Promise<ImageSearchResult> {
    return new Promise((resolve) => {
       let progress = 0;
       const interval = setInterval(() => {
          progress += Math.floor(Math.random() * 20) + 10;
          if (progress > 100) progress = 100;
          this.uploadProgress.set(progress);
          
          if (progress === 100) {
             clearInterval(interval);
             setTimeout(() => {
                resolve({
                   matches: [], // Mock results
                   aiAnalysis: 'تم التعرف على الشكل العام العقار: ڤيلا دورين مع حديقة.',
                   confidence: 0.85
                });
             }, 1000);
          }
       }, 500);
    });
  }

}
