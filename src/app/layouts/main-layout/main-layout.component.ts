import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { ChatbotComponent } from '../../pages/general/chatbot/chatbot/chatbot.component';
import { BackToTopComponent } from '../../shared/components/back-to-top/back-to-top.component';
import { CompareWidgetComponent } from '../../shared/components/compare-widget/compare-widget.component';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ChatbotComponent, BackToTopComponent, CompareWidgetComponent],
  template: `
    <div class="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display text-text-primary dark:text-white" dir="rtl">
      <app-header />
      <main class="flex-grow pt-16">
        <router-outlet />
      </main>
      <app-footer />
      @defer (on idle) { <app-chatbot /> } @placeholder { <div class="fixed bottom-6 right-6 w-16 h-16"></div> }
      <app-back-to-top />
      <app-compare-widget />
    </div>
  `
})
export class MainLayoutComponent {}