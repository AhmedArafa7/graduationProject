import { Component, signal, AfterViewInit, OnDestroy, PLATFORM_ID, inject, computed, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
// import * as L from 'leaflet'; // Removed to fix SSR
import { FavoritesService } from '../../../core/services/favorites.service';
import { ToastService } from '../../../core/services/toast.service';
import { PropertyService } from '../../../core/services/property.service';

@Component({
  selector: 'app-search-map',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './search-map.component.html',
  styleUrl: './search-map.component.scss'
})
export class SearchMapComponent implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private map: any | null = null; // Changed type to any (or L.Map if type imported)
  private markers: any[] = []; // Changed type to any (or L.Marker[])
  private L: any = null; // Leaflet module

  public favoritesService = inject(FavoritesService);
  private toast = inject(ToastService);
  private propertyService = inject(PropertyService);

  searchQuery = signal('القاهرة');
  hoveredPropertyId = signal<string | null>(null);

  // Use computed to get properties with valid coordinates
  realProperties = computed(() => {
    return this.propertyService.properties().filter(p => 
      p.location && p.location.coordinates && p.location.coordinates.coordinates && p.location.coordinates.coordinates.length === 2
    ).map(p => ({
      id: p._id,
      title: p.title,
      location: `${p.location.address}, ${p.location.city}`,
      price: p.price.toLocaleString(),
      image: p.coverImage || (p.images && p.images[0]) || '/assets/images/placeholder.jpg',
      beds: p.bedrooms,
      baths: p.bathrooms,
      area: p.area,
      // GeoJSON is [lng, lat], Leaflet wants [lat, lng]
      lat: p.location.coordinates!.coordinates[1],
      lng: p.location.coordinates!.coordinates[0]
    }));
  });

  constructor() {
    // Reactively update markers when data changes
    effect(() => {
      const props = this.realProperties();
      // Only run if map acts exists
      if (this.map && this.L && isPlatformBrowser(this.platformId)) {
        this.updateMarkers(props);
      }
    });
  }

  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Dynamic import to avoid SSR 'window is not defined' error
      try {
        this.L = await import('leaflet');
        // Small delay to ensure DOM is ready might still be good safety, or just call init
        this.initMap();
      } catch (error) {
        console.error('Failed to load Leaflet', error);
      }
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private initMap() {
    const mapElement = document.getElementById('search-leaflet-map');
    if (!mapElement || !this.L) return;

    if (this.map) return; // Prevent re-init

    // مركز القاهرة default
    this.map = this.L.map('search-leaflet-map').setView([30.0444, 31.2357], 11);

    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    // Initial load of markers
    this.updateMarkers(this.realProperties());
  }

  private updateMarkers(props: any[]) {
    if (!this.map || !this.L) return;

    // Clear existing markers
    this.markers.forEach(marker => marker.remove());
    this.markers = [];

    // Add new markers
    props.forEach(prop => {
      const customIcon = this.L.divIcon({
        className: 'custom-price-marker',
        html: `<div class="bg-primary text-white px-2 py-1 rounded-lg font-bold text-xs shadow-lg border-2 border-white whitespace-nowrap">${prop.price}</div>`,
        iconSize: [80, 30],
        iconAnchor: [40, 30]
      });

      const marker = this.L.marker([prop.lat, prop.lng], { icon: customIcon }).addTo(this.map!);
      
      marker.bindPopup(`
        <div class="text-center p-2 min-w-[180px]">
          <img src="${prop.image}" class="w-full h-20 object-cover rounded mb-2" alt="${prop.title}">
          <p class="font-bold text-sm text-gray-800">${prop.title}</p>
          <p class="text-primary font-bold">${prop.price} ج.م</p>
          <p class="text-xs text-gray-500">${prop.beds} غرف | ${prop.area} م²</p>
          <a href="/property/${prop.id}" class="block mt-2 text-xs bg-primary text-white py-1 rounded">التفاصيل</a>
        </div>
      `);

      marker.on('mouseover', () => this.hoveredPropertyId.set(prop.id));
      marker.on('mouseout', () => this.hoveredPropertyId.set(null));

      this.markers.push(marker);
    });
  }

  // تفاعل عند الوقوف على الكارت
  onCardHover(id: string | null) {
    this.hoveredPropertyId.set(id);
    
    // تسليط الضوء على الـ marker المناسب
    if (id && this.map && this.realProperties()) {
      const prop = this.realProperties().find(p => p.id === id);
      if (prop) {
        this.map.setView([prop.lat, prop.lng], 13, { animate: true });
      }
    }
  }

  // إضافة/إزالة من المفضلة
  toggleFavorite(event: MouseEvent, id: string) {
    event.stopPropagation();
    this.favoritesService.toggleFavorite(id);
    const isFav = this.favoritesService.isFavorite(id);
    this.toast.show(isFav ? 'تمت الإضافة للمفضلة' : 'تم الحذف من المفضلة', 'success');
  }

  // التحقق إذا كان العقار مفضل
  isFavorite(id: string) {
    return this.favoritesService.isFavorite(id);
  }
}