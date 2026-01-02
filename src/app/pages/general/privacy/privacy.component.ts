import { Component, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas'; // تأكد أنك قمت بتثبيتها

@Component({
  selector: 'app-privacy',
  imports: [CommonModule, RouterLink],
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.scss'
})
export class PrivacyComponent {
  private platformId = inject(PLATFORM_ID);
  
  lastUpdated = signal('1 يناير 2026');
  isGeneratingPdf = signal(false);

  scrollToSection(sectionId: string) {
    if (isPlatformBrowser(this.platformId)) {
      const element = document.getElementById(sectionId);
      if (element) {
        const headerOffset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  }

  downloadPdf() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.isGeneratingPdf.set(true);

    const data = document.getElementById('privacy-content-for-pdf');
    if (!data) {
      this.isGeneratingPdf.set(false);
      return;
    }

    // استخدام html2canvas لالتقاط المحتوى كصورة عالية الدقة
    html2canvas(data, { 
      scale: 2, // جودة عالية
      useCORS: true // للسماح بتحميل الصور الداخلية
    }).then((canvas) => {
      const imgWidth = 208; // عرض A4 بالمليمتر (ناقص الهوامش)
      const pageHeight = 295; // ارتفاع A4 بالمليمتر
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      const contentDataURL = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF
      let position = 0;

      // الصفحة الأولى
      pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // إذا كان المحتوى طويلاً، قم بإضافة صفحات جديدة
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('Baytology_Privacy_Policy.pdf');
      this.isGeneratingPdf.set(false);
    }).catch(err => {
      console.error('PDF generation failed', err);
      this.isGeneratingPdf.set(false);
    });
  }
}