import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { ChatbotComponent } from '../../pages/general/chatbot/chatbot/chatbot.component';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ChatbotComponent],
  template: `
    <div class="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display text-text-primary dark:text-white" dir="rtl">
      
      <app-header />

      <main class="flex-grow pt-16">
        <router-outlet />
      </main>

      <app-footer />
      
      @defer (on idle) {
        <app-chatbot />
      } @placeholder {
        <div class="fixed bottom-6 left-6 w-16 h-16 bg-transparent z-[-1]"></div>
      }

    </div>
  `
})
export class MainLayoutComponent {}