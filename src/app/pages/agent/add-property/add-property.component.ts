import { Component, signal, inject, AfterViewInit, OnDestroy, PLATFORM_ID, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AgentSidebarComponent } from '../../../shared/agent-sidebar/agent-sidebar.component';
import { ToastService } from '../../../core/services/toast.service';
import { AgentPropertiesService } from '../../../core/services/agent-properties.service';
import { NotificationService } from '../../../core/services/notification.service';
import { NgxImageCompressService as ImageCompressService } from 'ngx-image-compress';
import * as L from 'leaflet';

interface RoomDimension {
  name: string;
  length: number | null;
  width: number | null;
}

interface PropertyForm {
  title: string;
  propertyType: string;
  status: string;
  price: number | null;
  area: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floor: number | null;
  roomDimensions: RoomDimension[];
  description: string;
  latitude: string;
  longitude: string;
  locationId: string;
  amenities: {
    pool: boolean;
    garage: boolean;
    gym: boolean;
    garden: boolean;
    balcony: boolean;
    security: boolean;
    ac: boolean;
    petFriendly: boolean;
  };
  images: { file: File; preview: string; status: string; altText: string }[];
}

interface ValidationError {
  field: string;
  message: string;
}

@Component({
  selector: 'app-add-property',
  imports: [CommonModule, FormsModule, AgentSidebarComponent],
  templateUrl: './add-property.component.html',
  styleUrl: './add-property.component.scss'
})
export class AddPropertyComponent implements AfterViewInit, OnDestroy {
  private router = inject(Router);
  private toast = inject(ToastService);
  private agentProperties = inject(AgentPropertiesService);
  private notificationService = inject(NotificationService);
  private platformId = inject(PLATFORM_ID);

  @ViewChild('mapContainer') mapContainer!: ElementRef;

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;

  currentStep = signal(1);
  totalSteps = 4;
  validationErrors = signal<ValidationError[]>([]);

  // موقع القاهرة كموقع افتراضي
  private defaultLat = 30.0444;
  private defaultLng = 31.2357;

  form: PropertyForm = {
    title: '',
    propertyType: 'شقة',
    status: 'للبيع',
    price: null,
    area: null,
    bedrooms: null,
    bathrooms: null,
    floor: null,
    roomDimensions: [{ name: '', length: null, width: null }],
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
    },
    images: []
  };

  propertyTypes = ['شقة', 'فيلا', 'تاون هاوس', 'شاليه', 'أرض', 'تجاري'];
  statusOptions = ['للبيع', 'للإيجار'];

  get progressPercentage(): number {
    return (this.currentStep() / this.totalSteps) * 100;
  }

  ngAfterViewInit() {
    // تهيئة الخريطة عند فتح الخطوة 2
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  // تهيئة الخريطة
  initMap() {
    if (!isPlatformBrowser(this.platformId)) return;

    setTimeout(() => {
      const mapElement = document.getElementById('leaflet-map');
      if (!mapElement) return;

      // إذا الخريطة موجودة، فقط نحدث الحجم
      if (this.map) {
        this.map.invalidateSize();
        return;
      }

      // Fix for Leaflet default marker icons
      const iconDefault = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      L.Marker.prototype.options.icon = iconDefault;

      this.map = L.map('leaflet-map').setView([this.defaultLat, this.defaultLng], 10);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(this.map);

      // إضافة marker عند النقر
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        this.setMarker(e.latlng.lat, e.latlng.lng);
      });

      // إذا كان هناك قيم محفوظة
      if (this.form.latitude && this.form.longitude) {
        const lat = parseFloat(this.form.latitude);
        const lng = parseFloat(this.form.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          this.setMarker(lat, lng);
          this.map.setView([lat, lng], 15);
        }
      }
    }, 200);
  }

  // وضع marker على الخريطة
  setMarker(lat: number, lng: number) {
    if (!this.map) return;

    if (this.marker) {
      this.marker.remove();
    }

    // إصلاح مشكلة أيقونة الـ marker
    const customIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    this.marker = L.marker([lat, lng], { icon: customIcon }).addTo(this.map);
    this.marker.bindPopup('موقع العقار').openPopup();

    // تحديث القيم
    this.form.latitude = lat.toFixed(6);
    this.form.longitude = lng.toFixed(6);
    this.form.locationId = `LOC-${Date.now()}`;

    this.toast.show('تم تحديد الموقع', 'success');
  }

  // التحقق من صحة الخطوة الحالية
  validateCurrentStep(): boolean {
    const errors: ValidationError[] = [];
    
    switch (this.currentStep()) {
      case 1:
        if (!this.form.title.trim()) {
          errors.push({ field: 'title', message: 'عنوان العقار مطلوب' });
        }
        if (!this.form.price || this.form.price <= 0) {
          errors.push({ field: 'price', message: 'السعر مطلوب ويجب أن يكون أكبر من صفر' });
        }
        if (!this.form.area || this.form.area <= 0) {
          errors.push({ field: 'area', message: 'المساحة مطلوبة' });
        }
        if (!this.form.bedrooms || this.form.bedrooms < 0) {
          errors.push({ field: 'bedrooms', message: 'عدد الغرف مطلوب' });
        }
        if (!this.form.bathrooms || this.form.bathrooms < 0) {
          errors.push({ field: 'bathrooms', message: 'عدد الحمامات مطلوب' });
        }
        break;
        
      case 2:
        if (this.form.latitude && isNaN(parseFloat(this.form.latitude))) {
          errors.push({ field: 'latitude', message: 'خط العرض غير صحيح' });
        }
        if (this.form.longitude && isNaN(parseFloat(this.form.longitude))) {
          errors.push({ field: 'longitude', message: 'خط الطول غير صحيح' });
        }
        break;
    }
    
    this.validationErrors.set(errors);
    
    if (errors.length > 0) {
      this.toast.show(errors[0].message, 'error');
      return false;
    }
    
    return true;
  }

  hasError(field: string): boolean {
    return this.validationErrors().some(e => e.field === field);
  }

  nextStep() {
    if (!this.validateCurrentStep()) {
      return;
    }
    
    if (this.currentStep() < this.totalSteps) {
      this.currentStep.update(s => s + 1);
      this.validationErrors.set([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // تهيئة الخريطة عند الوصول للخطوة 2
      if (this.currentStep() === 2) {
        this.initMap();
      }
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
      this.validationErrors.set([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // إعادة تهيئة الخريطة عند العودة للخطوة 2
      if (this.currentStep() === 2) {
        this.initMap();
      }
    }
  }

  goToStep(step: number) {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep.set(step);
      this.validationErrors.set([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      if (step === 2) {
        this.initMap();
      }
    }
  }

  addRoom() {
    this.form.roomDimensions.push({ name: '', length: null, width: null });
  }

  removeRoom(index: number) {
    if (this.form.roomDimensions.length > 1) {
      this.form.roomDimensions.splice(index, 1);
    }
  }

  private imageCompress = inject(ImageCompressService);

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach(file => {
        // Validation check
        if (!file.type.startsWith('image/')) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
          const originalImage = e.target?.result as string;
          
          // Add as 'Analyzing' placeholder first (UX)
          const imageEntry = {
            file,
            preview: originalImage, // Show original while compressing
            status: 'جاري الضغط والتحليل...',
            altText: ''
          };
          this.form.images.push(imageEntry);

          // Compress
          this.imageCompress.compressFile(originalImage, -1, 50, 50).then(
            (compressedImage: string) => {
              // Update with compressed version
              imageEntry.preview = compressedImage;
              
              // Simulate AI Analysis (keep existing timeout logic for UX)
              setTimeout(() => {
                imageEntry.status = 'مكتمل';
                imageEntry.altText = `صورة ${file.name.split('.')[0]} - غرفة واسعة ومضيئة`;
              }, 1500);
            }
          );
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeImage(index: number) {
    this.form.images.splice(index, 1);
  }

  saveDraft() {
    localStorage.setItem('property_draft', JSON.stringify(this.form));
    this.toast.show('تم حفظ المسودة بنجاح', 'success');
  }

  validateForm(): boolean {
    if (!this.form.title.trim()) {
      this.toast.show('عنوان العقار مطلوب', 'error');
      this.goToStep(1);
      return false;
    }
    
    if (!this.form.price || this.form.price <= 0) {
      this.toast.show('السعر مطلوب', 'error');
      this.goToStep(1);
      return false;
    }
    
    if (!this.form.area || this.form.area <= 0) {
      this.toast.show('المساحة مطلوبة', 'error');
      this.goToStep(1);
      return false;
    }
    
    return true;
  }

  submitForm() {
    if (!this.validateForm()) {
      return;
    }
    
    const newProperty = this.agentProperties.addProperty({
      image: this.form.images.length > 0 
        ? this.form.images[0].preview 
        : 'https://images.unsplash.com/photo-1600596542815-e32cb51813b9?q=80&w=200&auto=format&fit=crop',
      address: this.form.title,
      price: this.formatPrice(this.form.price!),
      priceValue: this.form.price!,
      status: this.form.status === 'للبيع' ? 'للبيع' : 'للإيجار',
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
      images: this.form.images.map(img => img.preview)
    });
    
    this.toast.show('تم إضافة العقار بنجاح!', 'success');
    this.notificationService.notifyPropertyAdded(this.form.title);
    localStorage.removeItem('property_draft');
    
    setTimeout(() => {
      this.router.navigate(['/agent-dashboard']);
    }, 1000);
  }

  private formatPrice(price: number): string {
    return price.toLocaleString('ar-EG') + ' جنيه' + (this.form.status === 'للإيجار' ? '/شهر' : '');
  }
}
