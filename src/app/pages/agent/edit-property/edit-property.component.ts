import { Component, signal, inject, OnInit, AfterViewInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AgentSidebarComponent } from '../../../shared/agent-sidebar/agent-sidebar.component';
import { ToastService } from '../../../core/services/toast.service';
import { AgentPropertiesService } from '../../../core/services/agent-properties.service';
import { AgentProperty, PropertyAmenities, RoomDimension } from '../../../core/models/agent-property.model';
import { NotificationService } from '../../../core/services/notification.service';
import { NgxImageCompressService } from 'ngx-image-compress';
// import * as L from 'leaflet'; // Removed static import


@Component({
  selector: 'app-edit-property',
  imports: [CommonModule, FormsModule, AgentSidebarComponent],
  templateUrl: './edit-property.component.html',
  styleUrl: './edit-property.component.scss'
})
export class EditPropertyComponent implements OnInit, AfterViewInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  private agentProperties = inject(AgentPropertiesService);
  private notificationService = inject(NotificationService);
  private imageCompress = inject(NgxImageCompressService);
  private platformId = inject(PLATFORM_ID);

  private map: any | null = null; // Changed to any
  private marker: any | null = null; // Changed to any
  private L: any = null; // Leaflet module


  propertyId = signal<string | null>(null);
  isEditMode = signal(false);
  isLoading = signal(true);
  currentStep = signal(1);
  totalSteps = 3;

  form = {
    title: '',
    propertyType: 'شقة',
    status: 'للبيع' as 'للبيع' | 'للإيجار' | 'مباع' | 'معلق',
    price: null as number | null,
    area: null as number | null,
    bedrooms: null as number | null,
    bathrooms: null as number | null,
    floor: null as number | null,
    roomDimensions: [{ name: '', length: null, width: null }] as RoomDimension[],
    description: '',
    latitude: '',
    longitude: '',
    locationId: '',
    amenities: {
      pool: false,
      garage: false,
      gym: false,
      garden: false,
      balcony: false,
      security: false,
      ac: false,
      petFriendly: false
    } as PropertyAmenities,
    image: ''
  };

  propertyTypes = ['شقة', 'فيلا', 'تاون هاوس', 'شاليه', 'أرض', 'تجاري'];
  statusOptions: ('للبيع' | 'للإيجار' | 'مباع' | 'معلق')[] = ['للبيع', 'للإيجار', 'مباع', 'معلق'];
  roomTypes = ['غرفة نوم', 'حمام', 'غرفة معيشة', 'مطبخ', 'غرفة طعام', 'شرفة', 'حديقة', 'أخرى'];

  get progressPercentage(): number {
    return (this.currentStep() / this.totalSteps) * 100;
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.propertyId.set(id);
      this.loadProperty(id); // Call loadProperty with string ID
    } else {
      this.isLoading.set(false); // If no ID, it's a new property, not loading existing
    }
  }

  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
        try {
            this.L = await import('leaflet');
            // If we are somehow on step 2 already
            if (this.currentStep() === 2) this.initMap();
        } catch (error) {
            console.error('Failed to load Leaflet', error);
        }
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  loadProperty(id: string) {
    this.agentProperties.getPropertyById(id).subscribe({
      next: (property) => {
        if (property) {
          this.form.title = property.address;
          this.form.propertyType = property.propertyType || 'شقة';
          this.form.status = property.status as any;
          this.form.price = property.priceValue || null;
          this.form.area = property.area || null;
          this.form.bedrooms = property.bedrooms || null;
          this.form.bathrooms = property.bathrooms || null;
          this.form.floor = property.floor || null;
          this.form.roomDimensions = property.roomDimensions || [{ name: '', length: null, width: null }];
          this.form.description = property.description || '';
          this.form.latitude = property.latitude || '';
          this.form.longitude = property.longitude || '';
          this.form.locationId = property.locationId || '';
          this.form.amenities = property.amenities || {
            pool: false, garage: false, gym: false, garden: false,
            balcony: false, security: false, ac: false, petFriendly: false
          };
          this.form.image = property.image;
          this.isLoading.set(false);
          
          // Re-init map if needed/possible here or waiting for view
        }
      },
      error: (err) => {
        console.error('Error loading property', err);
        this.toast.show('العقار غير موجود', 'error');
        this.router.navigate(['/agent-dashboard']);
      }
    });
  }

  // --- Navigation Methods ---
  nextStep() {
    if (this.currentStep() < this.totalSteps) {
      if (this.validateCurrentStep()) {
        this.currentStep.update(v => v + 1);
        if (this.currentStep() === 2 && isPlatformBrowser(this.platformId)) {
          // Check if L is already loaded, if not, it will load eventually, but likely loaded by now
          if (this.L) {
              setTimeout(() => this.initMap(), 500); 
          }
        }
      }
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(v => v - 1);
    }
  }

  validateCurrentStep(): boolean {
    if (this.currentStep() === 1) {
      if (!this.form.title) { this.toast.show('العنوان مطلوب', 'error'); return false; }
      if (!this.form.price) { this.toast.show('السعر مطلوب', 'error'); return false; }
    }
    return true;
  }

  // --- File Handling ---
  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
         this.toast.show('حجم الصورة كبير جداً (الحد الأقصى 2 ميجابايت)', 'error');
         return;
      }
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.form.image = e.target.result;
        // Optionally compress here if needed using this.imageCompress
      };
      reader.readAsDataURL(file);
    }
  }

  addRoom() {
    const maxRooms = (this.form.bedrooms || 0) + (this.form.bathrooms || 0) + 3; // +3 for living, kitchen, etc.
    if (this.form.roomDimensions.length >= maxRooms) {
      this.toast.show(`لقد وصلت للحد الأقصى من الغرف (${maxRooms} غرفة)`, 'info');
      return;
    }
    this.form.roomDimensions.push({ name: '', length: null, width: null, image: undefined, imagePreview: undefined });
  }

  removeRoom(index: number) {
    if (this.form.roomDimensions.length > 1) {
      this.form.roomDimensions.splice(index, 1);
    }
  }

  onRoomImageSelected(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.toast.show('يرجى اختيار صورة صحيحة', 'error');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const originalImage = e.target?.result as string;
        
        // Show loading or immediate preview
        this.form.roomDimensions[index].imagePreview = originalImage;
        
        // Compress
        this.imageCompress.compressFile(originalImage, -1, 50, 50).then(
          (compressedImage: string) => {
            this.form.roomDimensions[index].imagePreview = compressedImage;
            this.form.roomDimensions[index].image = compressedImage;
          }
        );
      };
      reader.readAsDataURL(file);
    }
  }

  initMap() {
    if (!isPlatformBrowser(this.platformId) || !this.L) return;

      const mapContainer = document.getElementById('edit-leaflet-map');
      if (!mapContainer) return;

      if (this.map) {
          this.map.remove();
      }

      this.map = this.L.map('edit-leaflet-map').setView([30.0444, 31.2357], 13);
      this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap'
      }).addTo(this.map);

      // Add click handler
      this.map.on('click', (e: any) => {
          if (this.marker) {
              this.map!.removeLayer(this.marker);
          }
          this.marker = this.L.marker([e.latlng.lat, e.latlng.lng]).addTo(this.map!);
          this.form.latitude = e.latlng.lat.toString();
          this.form.longitude = e.latlng.lng.toString();
      });
      
      // Set initial marker if exists
      if(this.form.latitude && this.form.longitude) {
           const lat = parseFloat(this.form.latitude);
           const lng = parseFloat(this.form.longitude);
           if(!isNaN(lat) && !isNaN(lng)){
              this.marker = this.L.marker([lat, lng]).addTo(this.map);
              this.map.setView([lat, lng], 13);
           }
      }
  }

  saveChanges() {
    if (!this.form.title.trim()) {
      this.toast.show('عنوان العقار مطلوب', 'error');
      this.currentStep.set(1);
      return;
    }

    if (!this.form.price || this.form.price <= 0) {
      this.toast.show('السعر مطلوب', 'error');
      this.currentStep.set(1);
      return;
    }

    const id = this.propertyId();
    if (id) {
      const priceStr = this.form.price.toLocaleString('ar-EG') + ' جنيه' + 
        (this.form.status === 'للإيجار' ? '/شهر' : '');

      const roomImages = this.form.roomDimensions.filter(r => r.image || r.imagePreview).map(r => r.image || r.imagePreview as string);
      const allImages = this.form.image ? [this.form.image, ...roomImages] : roomImages;

      this.agentProperties.updateProperty(id, {
        address: this.form.title,
        price: priceStr,
        priceValue: this.form.price,
        status: this.form.status,
        propertyType: this.form.propertyType,
        area: this.form.area || undefined,
        bedrooms: this.form.bedrooms || undefined,
        bathrooms: this.form.bathrooms || undefined,
        floor: this.form.floor || undefined,
        roomDimensions: this.form.roomDimensions,
        description: this.form.description,
        latitude: this.form.latitude,
        longitude: this.form.longitude,
        locationId: this.form.locationId,
        amenities: this.form.amenities,
         image: allImages.length > 0 ? allImages[0] : '', // Add image update
         images: allImages
      }).subscribe({
        next: () => {
          this.toast.show('تم تحديث العقار بنجاح!', 'success');
          this.notificationService.addNotification('تحديث العقار', `تم تحديث "${this.form.title}" بنجاح`, 'property');
          
          setTimeout(() => {
            this.router.navigate(['/agent-dashboard']);
          }, 1000);
        },
        error: (err) => {
           console.error('Error updating property', err);
           this.toast.show('حدث خطأ أثناء التحديث', 'error');
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/agent-dashboard']);
  }
}
