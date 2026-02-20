import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'img[appImageFallback]',
  standalone: true
})
export class ImageFallbackDirective {
  @Input() appImageFallback: string = 'assets/images/property-placeholder.jpg';

  constructor(private eRef: ElementRef) {}

  @HostListener('error')
  loadFallback() {
    const element: HTMLImageElement = this.eRef.nativeElement;
    element.src = this.appImageFallback;
    // Prevent infinite loop if fallback fails
    element.onerror = null;
  }
}
