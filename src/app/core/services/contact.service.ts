import { Injectable, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  sendMessage(data: ContactForm): Observable<boolean> {
    // In a real app, this would be an HTTP POST request
    console.log('Sending message:', data);
    return of(true).pipe(delay(1500));
  }
}
