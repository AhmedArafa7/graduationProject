import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { ImageUploadService } from '../../../core/services/image-upload.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageUploadComponent {
  private uploadService = inject(ImageUploadService);
  private toast = inject(ToastService);

  isUploading = signal(false);
  uploadProgress = signal(0);
  status = signal<string>(''); // 'Uploading...' or 'Processing...'
  imageUrl = signal<string | null>(null);

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      
      // Validation
      if (!file.type.startsWith('image/')) {
        this.toast.show('Please select a valid image file', 'error');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB
        this.toast.show('File is too large (Max 10MB)', 'error');
        return;
      }

      this.uploadFile(file);
    }
  }

  uploadFile(file: File) {
    this.isUploading.set(true);
    this.uploadProgress.set(0);
    this.status.set('Uploading...');
    this.imageUrl.set(null);

    this.uploadService.uploadImage(file).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
          const percent = Math.round(100 * event.loaded / event.total);
          this.uploadProgress.set(percent);
          
          if (percent === 100) {
            this.status.set('Processing... (Optimizing Image)');
          }
        } else if (event instanceof HttpResponse) {
          this.isUploading.set(false);
          this.toast.show('Image uploaded and optimized successfully!', 'success');
          this.imageUrl.set(event.body.url);
        }
      },
      error: (err) => {
        this.isUploading.set(false);
        this.uploadProgress.set(0);
        console.error('Upload failed', err);
        this.toast.show('Upload failed. Please try again.', 'error');
      }
    });
  }
}
