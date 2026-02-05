import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { AgentPropertiesService, AgentProperty } from '../../../core/services/agent-properties.service';
import { AgentSidebarComponent } from '../../../shared/agent-sidebar/agent-sidebar.component';

@Component({
  selector: 'app-agent-dashboard',
  imports: [CommonModule, FormsModule, AgentSidebarComponent],
  templateUrl: './agent-dashboard.component.html',
  styleUrl: './agent-dashboard.component.scss'
})
export class AgentDashboardComponent {
  private toast = inject(ToastService);
  private router = inject(Router);
  private agentPropertiesService = inject(AgentPropertiesService);

  // استخدام الخدمة المشتركة
  properties = this.agentPropertiesService.properties;

  viewProperty(id: string) {
    this.router.navigate(['/property', id]);
  }

  editProperty(id: string) {
    this.router.navigate(['/agent/edit-property', id]);
  }

  deleteProperty(id: string) {
    if(confirm('هل أنت متأكد من حذف هذا العقار؟')) {
      this.agentPropertiesService.deleteProperty(id);
      this.toast.show('تم حذف العقار بنجاح', 'success');
    }
  }

  addNewProperty() {
    this.router.navigate(['/add-property']);
  }
}
