import { Component, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { AgentPropertiesService } from '../../../core/services/agent-properties.service';
import { AgentProperty } from '../../../core/models/agent-property.model';
import { AgentSidebarComponent } from '../../../shared/agent-sidebar/agent-sidebar.component';

@Component({
  selector: 'app-agent-dashboard',
  imports: [CommonModule, FormsModule, AgentSidebarComponent],
  templateUrl: './agent-dashboard.component.html',
  styleUrl: './agent-dashboard.component.scss'
})
export class AgentDashboardComponent implements OnInit {
  private toast = inject(ToastService);
  private router = inject(Router);
  private agentPropertiesService = inject(AgentPropertiesService);

  // استخدام الخدمة المشتركة
  properties = signal<AgentProperty[]>([]);

  ngOnInit() {
    this.loadProperties();
  }

  loadProperties() {
    this.agentPropertiesService.getAgentProperties().subscribe({
      next: (data) => this.properties.set(data),
      error: (err) => {
        console.error('Error loading properties', err);
        // this.toast.show('تعذر تحميل العقارات', 'error'); // Optional: prevent spam on init if empty
      }
    });
  }

  viewProperty(id: string) {
    this.router.navigate(['/property', id]);
  }

  editProperty(id: string) {
    this.router.navigate(['/agent/edit-property', id]);
  }

  deleteProperty(id: string) {
    if(confirm('هل أنت متأكد من حذف هذا العقار؟')) {
      this.agentPropertiesService.deleteProperty(id).subscribe({
        next: () => {
           this.toast.show('تم حذف العقار بنجاح', 'success');
           this.loadProperties(); // Refresh list
        },
        error: (err) => this.toast.show('حدث خطأ أثناء الحذف', 'error')
      });
    }
  }

  addNewProperty() {
    this.router.navigate(['/add-property']);
  }
}
