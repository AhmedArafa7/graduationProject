import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from '../../../core/services/chatbot/chatbot.service'; // استيراد الخدمة
import { FaqService } from '../../../core/services/faq.service';

@Component({
  selector: 'app-faq',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent {
  private chatbotService = inject(ChatbotService); // حقن الخدمة
  private faqService = inject(FaqService);
  
  // UI States
  searchQuery = signal('');
  activeCategory = signal('الكل');
  openQuestionId = signal<number | null>(null); // لتحديد السؤال المفتوح

  // الأقسام
  categories = this.faqService.getCategories();

  // قائمة الأسئلة والأجوبة
  allFaqs = this.faqService.faqs;

  // فلترة الأسئلة
  filteredFaqs = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const category = this.activeCategory();

    return this.allFaqs().filter(faq => {
      const matchesSearch = faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query);
      const matchesCategory = category === 'الكل' || faq.category === category;
      return matchesSearch && matchesCategory;
    });
  });

  // دوال التفاعل
  setCategory(cat: string) {
    this.activeCategory.set(cat);
    this.openQuestionId.set(null); // إغلاق الأسئلة عند تغيير القسم
  }

  toggleQuestion(id: number) {
    if (this.openQuestionId() === id) {
      this.openQuestionId.set(null); // إغلاق إذا كان مفتوحاً
    } else {
      this.openQuestionId.set(id); // فتح الجديد
    }
  }
    // دالة لفتح الشات
  openChatbot() {
    this.chatbotService.open();
  }
}
