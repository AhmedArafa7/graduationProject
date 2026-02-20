import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SavedSearchService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/saved-searches`;

  saveSearch(search: any): Observable<any> {
    return this.http.post(this.apiUrl, search);
  }

  getSavedSearches(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?userId=${userId}`);
  }

  deleteSavedSearch(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
