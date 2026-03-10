import { Component, signal, inject, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';
import { UserService } from '../../../core/services/user.service';
import { DEFAULT_AVATAR } from '../../../core/models/user.model';
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
  
  // Pending Profile Image for Editing
  pendingProfileImage = signal<string | null>(null);
  
  // هل المستخدم وكيل؟
  isAgent = computed(() => ['agent', 'owner'].includes(this.userService.userData().userType));

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
    bio: '',
    city: '',
    languages: '',
    workingHours: ''
  });

  // UI States
  isEditing = signal(false);
  isImageFullscreen = signal(false);

  // History for Undo/Redo
  private readonly HISTORY_KEY = 'profile_edit_history';
  historyStack = signal<any[]>([]);
  historyIndex = signal(-1);

  canUndo = computed(() => this.historyIndex() > 0);
  canRedo = computed(() => this.historyIndex() < this.historyStack().length - 1);

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
    
    if (['agent', 'owner'].includes(userData.userType)) {
      this.agentInfo.set({
        licenseNumber: userData.licenseNumber || '',
        company: userData.company || '',
        experience: userData.experience || '',
        specialization: userData.specialization || '',
        bio: userData.bio || '',
        city: userData.city || '',
        languages: userData.languages?.join(', ') || '',
        workingHours: userData.workingHours || ''
      });
    }
  }

  setActiveTab(tab: 'personal' | 'agent') {
    this.activeTab.set(tab);
  }

  // Handle Image Click Based on Mode
  onImageClick(fileInput: HTMLInputElement) {
    if (this.isEditing()) {
      fileInput.click();
    } else {
      // Show full-screen preview when not editing
      this.isImageFullscreen.set(true);
    }
  }

  // Close Full-Screen Preview
  closeFullscreenImage() {
    this.isImageFullscreen.set(false);
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
         // Store selected image temporarily without updating the backend
         this.pendingProfileImage.set(e.target?.result as string);
         this.toast.show('تم معاينة الصورة. اضغط "حفظ التغييرات" لتأكيد الرفع.', 'info');
      };
      reader.readAsDataURL(file);
    }
  }

  // Toggle Edit Mode
  toggleEdit() {
    if (this.isEditing()) {
      // إلغاء - إعادة تحميل البيانات الأصلية
      this.cancelChanges();
    } else {
      this.isEditing.set(true);
      this.initHistory();
    }
  }

  // --- History Management (Undo/Redo) ---
  private initHistory() {
    // Attempt to load history from LocalStorage if session active
    if (typeof localStorage !== 'undefined') {
      const savedHistory = localStorage.getItem(this.HISTORY_KEY);
      if (savedHistory) {
        try {
          const parsed = JSON.parse(savedHistory);
          this.historyStack.set(parsed.stack || []);
          this.historyIndex.set(parsed.index ?? -1);
          
          // Restore state if history exists
          if (this.historyIndex() >= 0 && this.historyStack()[this.historyIndex()]) {
            this.restoreState(this.historyStack()[this.historyIndex()]);
          } else {
            this.saveStateToHistory(); // starting point
          }
          return;
        } catch (e) {
          console.error("Failed to parse history from LocalStorage");
        }
      }
    }
    
    // Fresh history
    this.historyStack.set([]);
    this.historyIndex.set(-1);
    this.saveStateToHistory(); // Push initial state
  }

  private saveStateToHistory() {
    const currentState = {
      personalInfo: { ...this.personalInfo() },
      agentInfo: { ...this.agentInfo() },
      pendingProfileImage: this.pendingProfileImage()
    };

    // If we're not at the end of the stack (we undid and then changed something)
    // Discard future history
    let stack = this.historyStack();
    let index = this.historyIndex();
    
    if (index < stack.length - 1) {
      stack = stack.slice(0, index + 1);
    }

    stack.push(currentState);
    
    // Limit to 50 steps to prevent massive storage usage
    if (stack.length > 50) {
      stack.shift();
    } else {
      index++;
    }

    this.historyStack.set(stack);
    this.historyIndex.set(index);
    this.persistHistory();
  }

  private persistHistory() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.HISTORY_KEY, JSON.stringify({
          stack: this.historyStack(),
          index: this.historyIndex()
        }));
      } catch (e) {
        console.warn('LocalStorage is full, history might not be saved completely.');
      }
    }
  }

  private restoreState(state: any) {
    if (!state) return;
    this.personalInfo.set(state.personalInfo);
    this.agentInfo.set(state.agentInfo);
    this.pendingProfileImage.set(state.pendingProfileImage);
  }

  undoChanges() {
    if (this.canUndo()) {
      const newIndex = this.historyIndex() - 1;
      this.historyIndex.set(newIndex);
      this.restoreState(this.historyStack()[newIndex]);
      this.persistHistory();
    }
  }

  redoChanges() {
    if (this.canRedo()) {
      const newIndex = this.historyIndex() + 1;
      this.historyIndex.set(newIndex);
      this.restoreState(this.historyStack()[newIndex]);
      this.persistHistory();
    }
  }

  private clearHistory() {
    this.historyStack.set([]);
    this.historyIndex.set(-1);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.HISTORY_KEY);
    }
  }

  // Update Personal Info Fields
  updateFirstName(value: string) {
    this.personalInfo.update(info => ({...info, firstName: value}));
    this.saveStateToHistory();
  }

  updateLastName(value: string) {
    this.personalInfo.update(info => ({...info, lastName: value}));
    this.saveStateToHistory();
  }

  updateEmail(value: string) {
    this.personalInfo.update(info => ({...info, email: value}));
    this.saveStateToHistory();
  }

  updatePhone(value: string) {
    this.personalInfo.update(info => ({...info, phone: value}));
    this.saveStateToHistory();
  }

  // Update Agent Info Fields
  updateLicenseNumber(value: string) {
    this.agentInfo.update(info => ({...info, licenseNumber: value}));
    this.saveStateToHistory();
  }

  updateCompany(value: string) {
    this.agentInfo.update(info => ({...info, company: value}));
    this.saveStateToHistory();
  }

  updateExperience(value: string) {
    this.agentInfo.update(info => ({...info, experience: value}));
    this.saveStateToHistory();
  }

  updateSpecialization(value: string) {
    this.agentInfo.update(info => ({...info, specialization: value}));
    this.saveStateToHistory();
  }

  updateBio(value: string) {
    this.agentInfo.update(info => ({...info, bio: value}));
    this.saveStateToHistory();
  }

  updateCity(value: string) {
    this.agentInfo.update(info => ({...info, city: value}));
    this.saveStateToHistory();
  }

  updateLanguages(value: string) {
    this.agentInfo.update(info => ({...info, languages: value}));
    this.saveStateToHistory();
  }

  updateWorkingHours(value: string) {
    this.agentInfo.update(info => ({...info, workingHours: value}));
    this.saveStateToHistory();
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
    // Get current user ID
    const currentUser = this.userService.userData();
    const userId = currentUser._id || '1'; // Fallback if no ID

    const agentData = this.agentInfo();
    const formattedLanguages = agentData.languages 
      ? agentData.languages.split(',').map(l => l.trim()).filter(Boolean)
      : [];

    this.userService.updateUser(userId, {
      firstName: info.firstName,
      lastName: info.lastName,
      email: info.email,
      phone: info.phone,
      ...agentData,
      languages: formattedLanguages
    });

    // Check if there is a pending image to save
    if (this.pendingProfileImage()) {
       this.userService.updateProfileImage(userId, this.pendingProfileImage()).subscribe({
         next: () => {
           this.pendingProfileImage.set(null); // Clear pending
           this.toast.show('تم حفظ التغييرات وتحديث الصورة بنجاح!', 'success');
           this.clearHistory();
           this.isEditing.set(false);
         },
         error: () => {
            this.toast.show('تم حفظ البيانات، لكن فشل تحديث الصورة.', 'error');
            this.clearHistory();
            this.isEditing.set(false);
         }
       });
    } else {
       this.toast.show('تم حفظ التغييرات بنجاح!', 'success');
       this.clearHistory();
       this.isEditing.set(false);
    }
  }

  // Cancel Changes
  cancelChanges() {
    this.loadUserData(); // إعادة تحميل البيانات الأصلية
    this.pendingProfileImage.set(null); // مسح الصورة المؤقتة
    this.clearHistory();
    this.isEditing.set(false);
    this.toast.show('تم إلغاء التغييرات', 'info');
  }
}
