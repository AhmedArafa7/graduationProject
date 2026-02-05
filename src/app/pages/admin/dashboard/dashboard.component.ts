import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../../core/services/report.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styles: []
})
export class DashboardComponent implements OnInit {
  private reportService = inject(ReportService);
  private toast = inject(ToastService);

  reports = signal<any[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.reportService.getAllReports().subscribe({
      next: (data) => {
        this.reports.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  deleteProperty(propertyId: string) {
    if (!confirm('هل أنت متأكد من حذف هذا العقار؟ هذا الإجراء لا يمكن التراجع عنه.')) return;

    this.reportService.deletePropertyAndResolve(propertyId).subscribe({
      next: () => {
        this.toast.show('تم حذف العقار وحل البلاغات المرتبطة.', 'success');
        this.loadReports(); // Refresh data
      },
      error: (err) => {
        console.error(err);
        this.toast.show('فشل حذف العقار', 'error');
      }
    });
  }

  banUser(userId: string) {
    if (!confirm('هل أنت متأكد من حظر هذا المستخدم؟ لن يتمكن من تسجيل الدخول مرة أخرى.')) return;

    this.reportService.banUser(userId).subscribe({
      next: () => {
        this.toast.show('تم حظر المستخدم بنجاح.', 'success');
      },
      error: (err) => {
        console.error(err);
        this.toast.show('فشل حظر المستخدم', 'error');
      }
    });
  }
}
