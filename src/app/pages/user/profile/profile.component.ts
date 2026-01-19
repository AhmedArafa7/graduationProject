import { Component, signal, inject, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';
import { UserService, DEFAULT_AVATAR } from '../../../core/services/user.service';
import { AgentSidebarComponent } from '../../../shared/agent-sidebar/agent-sidebar.component';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, AgentSidebarComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private toast = inject(ToastService);
  public userService = inject(UserService);

  // Active Tab
  activeTab = signal<'personal' | 'agent'>('personal');

  // Profile Image - مرتبط بـ UserService
  profileImage = computed(() => this.userService.getProfileImage());
  
  // هل المستخدم وكيل؟
  isAgent = computed(() => this.userService.userData().userType === 'agent');

  // Personal Information - مرتبط بـ UserService
  personalInfo = signal({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  // Agent Information
  agentInfo = signal({
    licenseNumber: '',
    company: '',
    experience: '',
    specialization: '',
    bio: ''
  });

  // UI States
  isEditing = signal(false);

  ngOnInit() {
    // تحميل بيانات المستخدم من الـ Service
    this.loadUserData();
  }

  private loadUserData() {
    const userData = this.userService.userData();
    this.personalInfo.set({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone
    });
    
    if (userData.userType === 'agent') {
      this.agentInfo.set({
        licenseNumber: userData.licenseNumber || '',
        company: userData.company || '',
        experience: userData.experience || '',
        specialization: userData.specialization || '',
        bio: userData.bio || ''
      });
    }
  }

  setActiveTab(tab: 'personal' | 'agent') {
    this.activeTab.set(tab);
  }

  // File Input Trigger
  triggerFileInput(fileInput: HTMLInputElement) {
    if (this.isEditing()) {
      fileInput.click();
    }
  }

  // Handle Image Selection
  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      if (!file.type.startsWith('image/')) {
        this.toast.show('يرجى اختيار ملف صورة صحيح', 'error');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        this.toast.show('حجم الصورة يجب أن يكون أقل من 5 ميجابايت', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.userService.updateProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  // Toggle Edit Mode
  toggleEdit() {
    if (this.isEditing()) {
      // إلغاء - إعادة تحميل البيانات الأصلية
      this.loadUserData();
    }
    this.isEditing.update(v => !v);
  }

  // Update Personal Info Fields
  updateFirstName(value: string) {
    this.personalInfo.update(info => ({...info, firstName: value}));
  }

  updateLastName(value: string) {
    this.personalInfo.update(info => ({...info, lastName: value}));
  }

  updateEmail(value: string) {
    this.personalInfo.update(info => ({...info, email: value}));
  }

  updatePhone(value: string) {
    this.personalInfo.update(info => ({...info, phone: value}));
  }

  // Update Agent Info Fields
  updateLicenseNumber(value: string) {
    this.agentInfo.update(info => ({...info, licenseNumber: value}));
  }

  updateCompany(value: string) {
    this.agentInfo.update(info => ({...info, company: value}));
  }

  updateExperience(value: string) {
    this.agentInfo.update(info => ({...info, experience: value}));
  }

  updateSpecialization(value: string) {
    this.agentInfo.update(info => ({...info, specialization: value}));
  }

  updateBio(value: string) {
    this.agentInfo.update(info => ({...info, bio: value}));
  }

  // Save Changes
  saveChanges() {
    const info = this.personalInfo();
    
    if (!info.firstName.trim() || !info.lastName.trim()) {
      this.toast.show('يرجى إدخال الاسم الأول والأخير', 'error');
      return;
    }

    if (!info.email.trim() || !info.email.includes('@')) {
      this.toast.show('يرجى إدخال بريد إلكتروني صحيح', 'error');
      return;
    }

    // حفظ في UserService
    this.userService.updateUser({
      firstName: info.firstName,
      lastName: info.lastName,
      email: info.email,
      phone: info.phone,
      ...this.agentInfo()
    });

    this.toast.show('تم حفظ التغييرات بنجاح!', 'success');
    this.isEditing.set(false);
  }

  // Cancel Changes
  cancelChanges() {
    this.loadUserData(); // إعادة تحميل البيانات الأصلية
    this.isEditing.set(false);
    this.toast.show('تم إلغاء التغييرات', 'info');
  }
}
