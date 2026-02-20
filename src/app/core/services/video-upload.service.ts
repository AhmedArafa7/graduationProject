import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VideoUploadService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/upload/video`;

  uploadVideo(file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('video', file);

    const req = new HttpRequest('POST', this.apiUrl, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }
}
