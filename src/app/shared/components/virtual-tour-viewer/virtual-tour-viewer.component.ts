import { Component, Input, Output, EventEmitter, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

declare var window: any;

interface RoomNode {
  id: string;
  name: string;
  panorama: string;
  x: number; // For floor plan dot position (%)
  y: number; // For floor plan dot position (%)
}

@Component({
  selector: 'app-virtual-tour-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './virtual-tour-viewer.component.html',
  styleUrls: ['./virtual-tour-viewer.component.scss']
})
export class VirtualTourViewerComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() isOpen = false;
  @Output() closeTour = new EventEmitter<void>();

  @ViewChild('panoramaContainer') panoramaContainer!: ElementRef;
  
  private platformId = inject(PLATFORM_ID);
  private viewer: any;
  private pannellumScriptLoaded = false;

  activeRoomId = 'living-room';

  // Fake Data for the Showcase
  rooms: RoomNode[] = [
    {
      id: 'living-room',
      name: 'غرفة المعيشة',
      panorama: 'https://pannellum.org/images/alma.jpg',
      x: 30, y: 70
    },
    {
      id: 'bedroom',
      name: 'غرفة النوم',
      panorama: 'https://pannellum.org/images/bma-0.jpg',
      x: 70, y: 30
    },
    {
      id: 'kitchen',
      name: 'المطبخ',
      panorama: 'https://pannellum.org/images/cerro-paranal.jpg',
      x: 30, y: 30
    }
  ];

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadPannellumLibrary();
    }
  }

  ngAfterViewInit() {
    if (this.isOpen) {
      this.initViewer();
    }
  }

  ngOnDestroy() {
    this.destroyViewer(); 
  }

  close() {
    this.isOpen = false;
    this.destroyViewer();
    this.closeTour.emit();
  }

  private loadPannellumLibrary() {
    if (document.getElementById('pannellum-script')) {
      this.pannellumScriptLoaded = true;
      return;
    }

    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement('script');
    script.id = 'pannellum-script';
    script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
    script.onload = () => {
      this.pannellumScriptLoaded = true;
      if (this.isOpen) {
        this.initViewer();
      }
    };
    document.body.appendChild(script);
  }

  private initViewer() {
    if (!isPlatformBrowser(this.platformId) || !this.pannellumScriptLoaded || !this.panoramaContainer) return;
    
    // Slight delay to ensure DOM is ready
    setTimeout(() => {
      const activeRoom = this.rooms.find(r => r.id === this.activeRoomId) || this.rooms[0];
      this.renderRoom(activeRoom);
    }, 100);
  }

  private renderRoom(room: RoomNode) {
    this.destroyViewer(); // Clean up previous instance

    if (window.pannellum && this.panoramaContainer) {
      this.viewer = window.pannellum.viewer(this.panoramaContainer.nativeElement, {
        type: 'equirectangular',
        panorama: room.panorama,
        autoLoad: true,
        compass: true,
        showZoomCtrl: false,
        mouseZoom: false,
        orientationOnByDefault: true // Enables Gyroscope on mobile
      });
    }
  }

  private destroyViewer() {
    if (this.viewer) {
      try {
        this.viewer.destroy();
      } catch (e) {
        console.error('Error destroying Pannellum viewer', e);
      }
      this.viewer = null;
    }
  }

  changeRoom(roomId: string) {
    this.activeRoomId = roomId;
    const room = this.rooms.find(r => r.id === roomId);
    if (room) {
      this.renderRoom(room);
    }
  }
}
