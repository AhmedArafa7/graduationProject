import { Component, signal, inject, OnInit, AfterViewInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AgentSidebarComponent } from '../../../shared/agent-sidebar/agent-sidebar.component';
import { ToastService } from '../../../core/services/toast.service';
import { AgentPropertiesService, AgentProperty, PropertyAmenities, RoomDimension } from '../../../core/services/agent-properties.service';
import { NotificationService } from '../../../core/services/notification.service';
import * as L from 'leaflet';

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
  private platformId = inject(PLATFORM_ID);

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;

  propertyId = signal<number | null>(null);
  isLoading = signal(true);
  currentStep = signal(1);
  totalSteps = 4;

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

  get progressPercentage(): number {
    return (this.currentStep() / this.totalSteps) * 100;
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      this.propertyId.set(id);
      this.loadProperty(id);
    });
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  loadProperty(id: number) {
    const property = this.agentProperties.getPropertyById(id);
    
    if (property) {
      this.form.title = property.address;
      this.form.propertyType = property.propertyType || 'شقة';
      this.form.status = property.status;
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
    } else {
      this.toast.show('العقار غير موجود', 'error');
      this.router.navigate(['/agent-dashboard']);
    }
  }

  initMap() {
    if (!isPlatformBrowser(this.platformId)) return;

    setTimeout(() => {
      const mapElement = document.getElementById('edit-leaflet-map');
      if (!mapElement) return;

      // إذا الخريطة موجودة، فقط نحدث الحجم
      if (this.map) {
        this.map.invalidateSize();
        return;
      }

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

      const lat = this.form.latitude ? parseFloat(this.form.latitude) : 30.0444;
      const lng = this.form.longitude ? parseFloat(this.form.longitude) : 31.2357;

      this.map = L.map('edit-leaflet-map').setView([lat, lng], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(this.map);

      if (this.form.latitude && this.form.longitude) {
        this.setMarker(lat, lng, false);
      }

      this.map.on('click', (e: L.LeafletMouseEvent) => {
        this.setMarker(e.latlng.lat, e.latlng.lng, true);
      });
    }, 200);
  }

  setMarker(lat: number, lng: number, showToast = true) {
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

    this.form.latitude = lat.toFixed(6);
    this.form.longitude = lng.toFixed(6);
    this.form.locationId = `LOC-${Date.now()}`;

    if (showToast) {
      this.toast.show('تم تحديد الموقع', 'success');
    }
  }

  nextStep() {
    if (this.currentStep() < this.totalSteps) {
      this.currentStep.update(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      if (this.currentStep() === 2) {
        this.initMap();
      }
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // إعادة تهيئة الخريطة عند العودة للخطوة 2
      if (this.currentStep() === 2) {
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
        amenities: this.form.amenities
      });

      this.toast.show('تم تحديث العقار بنجاح!', 'success');
      this.notificationService.addNotification('تحديث العقار', `تم تحديث "${this.form.title}" بنجاح`, 'property');
      
      setTimeout(() => {
        this.router.navigate(['/agent-dashboard']);
      }, 1000);
    }
  }

  cancel() {
    this.router.navigate(['/agent-dashboard']);
  }
}
