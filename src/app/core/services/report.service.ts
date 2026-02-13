import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

import { Report } from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reports`;
  private adminUrl = `${environment.apiUrl}/admin`;

  // Create a new report
  reportProperty(propertyId: string, reporterId: string, reason: string): Observable<any> {
    const report = {
      property: propertyId,
      reporter: reporterId,
      reason
    };
    return this.http.post(this.apiUrl, report);
  }

  // Admin: Get all reports
  getAllReports(): Observable<any[]> {
    return this.http.get<any[]>(`${this.adminUrl}/reports`);
  }

  // Admin: Delete Property & Resolve
  deletePropertyAndResolve(propertyId: string): Observable<any> {
    return this.http.delete(`${this.adminUrl}/property/${propertyId}`);
  }

  // Admin: Ban User
  banUser(userId: string): Observable<any> {
    return this.http.post(`${this.adminUrl}/ban/${userId}`, {});
  }
}
