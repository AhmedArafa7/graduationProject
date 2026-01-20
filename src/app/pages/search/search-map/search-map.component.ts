import { Component, signal, AfterViewInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { FavoritesService } from '../../../core/services/favorites.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-search-map',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './search-map.component.html',
  styleUrl: './search-map.component.scss'
})
export class SearchMapComponent implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private map: L.Map | null = null;
  private markers: L.Marker[] = [];
  public favoritesService = inject(FavoritesService);
  private toast = inject(ToastService);

  searchQuery = signal('القاهرة');
  hoveredPropertyId = signal<number | null>(null);

  // بيانات العقارات مع إحداثيات حقيقية للقاهرة
  properties = [
    {
      id: 1,
      title: 'فيلا حديثة بإطلالة على النيل',
      location: 'الزمالك، القاهرة',
      price: '15,000,000',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop',
      beds: 4,
      baths: 5,
      area: 500,
      lat: 30.0609,
      lng: 31.2193
    },
    {
      id: 2,
      title: 'شقة مريحة في وسط البلد',
      location: 'وسط البلد، القاهرة',
      price: '3,200,000',
      image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=400&auto=format&fit=crop',
      beds: 2,
      baths: 2,
      area: 150,
      lat: 30.0444,
      lng: 31.2357
    },
    {
      id: 3,
      title: 'شقة في التجمع الخامس',
      location: 'التجمع الخامس، القاهرة',
      price: '5,500,000',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=400&auto=format&fit=crop',
      beds: 3,
      baths: 3,
      area: 210,
      lat: 30.0131,
      lng: 31.4306
    },
    {
      id: 4,
      title: 'بنتهاوس في الشيخ زايد',
      location: 'الشيخ زايد، الجيزة',
      price: '8,900,000',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=400&auto=format&fit=crop',
      beds: 4,
      baths: 5,
      area: 350,
      lat: 30.0174,
      lng: 30.9728
    }
  ];

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.initMap(), 100);
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
    if (!mapElement) return;

    // مركز القاهرة
    this.map = L.map('search-leaflet-map').setView([30.0444, 31.2357], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    // إضافة markers للعقارات
    this.properties.forEach(prop => {
      const customIcon = L.divIcon({
        className: 'custom-price-marker',
        html: `<div class="bg-primary text-white px-2 py-1 rounded-lg font-bold text-xs shadow-lg border-2 border-white whitespace-nowrap">${prop.price}</div>`,
        iconSize: [80, 30],
        iconAnchor: [40, 30]
      });

      const marker = L.marker([prop.lat, prop.lng], { icon: customIcon }).addTo(this.map!);
      
      marker.bindPopup(`
        <div class="text-center p-2 min-w-[180px]">
          <img src="${prop.image}" class="w-full h-20 object-cover rounded mb-2" alt="${prop.title}">
          <p class="font-bold text-sm">${prop.title}</p>
          <p class="text-primary font-bold">${prop.price} ج.م</p>
          <p class="text-xs text-gray-500">${prop.beds} غرف | ${prop.area} م²</p>
        </div>
      `);

      marker.on('mouseover', () => this.hoveredPropertyId.set(prop.id));
      marker.on('mouseout', () => this.hoveredPropertyId.set(null));

      this.markers.push(marker);
    });
  }

  // تفاعل عند الوقوف على الكارت
  onCardHover(id: number | null) {
    this.hoveredPropertyId.set(id);
    
    // تسليط الضوء على الـ marker المناسب
    if (id && this.map) {
      const prop = this.properties.find(p => p.id === id);
      if (prop) {
        this.map.setView([prop.lat, prop.lng], 13, { animate: true });
      }
    }
  }

  // إضافة/إزالة من المفضلة
  toggleFavorite(event: Event, id: number) {
    event.stopPropagation();
    event.preventDefault();
    this.favoritesService.toggleFavorite(id);
    const isFav = this.favoritesService.isFavorite(id);
    this.toast.show(isFav ? 'تمت الإضافة للمفضلة' : 'تمت الإزالة من المفضلة', 'info');
  }

  // التحقق إذا كان العقار مفضل
  isFavorite(id: number): boolean {
    return this.favoritesService.isFavorite(id);
  }
}