import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

import { ContactForm } from '../models/contact.model';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/messages`;

  sendMessage(data: ContactForm): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}
