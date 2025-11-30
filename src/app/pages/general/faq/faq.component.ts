import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from '../../../core/services/chatbot/chatbot.service'; // استيراد الخدمة

@Component({
  selector: 'app-faq',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent {
  private chatbotService = inject(ChatbotService); // حقن الخدمة
  // UI States
  searchQuery = signal('');
  activeCategory = signal('الكل');
  openQuestionId = signal<number | null>(null); // لتحديد السؤال المفتوح

  // الأقسام
  categories = [
    'الكل',
    'عامة',
    'للمشترين',
    'للوكلاء',
    'المدفوعات',
    'تقنية'
  ];

  // قائمة الأسئلة والأجوبة (Mock Data)
  allFaqs = [
    {
      id: 1,
      question: 'كيف يمكنني استخدام البحث بالذكاء الاصطناعي؟',
      answer: 'البحث بالذكاء الاصطناعي في Baytology يسمح لك بوصف منزل أحلامك بلغة طبيعية (مثال: "شقة في التجمع 3 غرف بحديقة"). فقط اكتب ما تبحث عنه في شريط البحث الرئيسي، وسيقوم نظامنا بتحليل طلبك وعرض العقارات الأكثر تطابقاً.',
      category: 'عامة'
    },
    {
      id: 2,
      question: 'ما هي تكلفة استخدام منصة Baytology؟',
      answer: 'التصفح والبحث عن العقارات والتواصل مع الوكلاء مجاني تماماً للمشترين والمستأجرين. يتم تطبيق رسوم اشتراك فقط على الوكلاء العقاريين والمطورين الراغبين في عرض عقاراتهم.',
      category: 'عامة'
    },
    {
      id: 3,
      question: 'كيف يمكنني التواصل مع وكيل عقاري؟',
      answer: 'عندما تجد عقاراً يعجبك، ستجد زر "تواصل" أو "واتساب" في صفحة التفاصيل. يمكنك أيضاً زيارة ملف الوكيل الشخصي لرؤية كافة طرق الاتصال المتاحة وساعات العمل.',
      category: 'للمشترين'
    },
    {
      id: 4,
      question: 'هل البيانات المعروضة عن الأسعار دقيقة؟',
      answer: 'نعم، نستخدم خوارزميات متطورة لتحليل بيانات السوق الحقيقية وتحديث تقديرات الأسعار يومياً. ومع ذلك، السعر النهائي يخضع دائماً للتفاوض بين البائع والمشتري.',
      category: 'للمشترين'
    },
    {
      id: 5,
      question: 'كيف يمكنني الانضمام كوكيل عقاري؟',
      answer: 'يمكنك التسجيل كوكيل عن طريق الضغط على "إنشاء حساب" واختيار "وكيل عقاري". ستحتاج لتقديم رخصة مزاولة المهنة وبعض المستندات للتحقق من هويتك قبل تفعيل الحساب.',
      category: 'للوكلاء'
    },
    {
      id: 6,
      question: 'ما هي طرق الدفع المتاحة للاشتراكات؟',
      answer: 'نقبل الدفع عبر البطاقات الائتمانية (Visa, MasterCard)، ومحفظة فودافون كاش، وخدمة فوري.',
      category: 'المدفوعات'
    },
    {
      id: 7,
      question: 'نسيت كلمة المرور، ماذا أفعل؟',
      answer: 'يمكنك استعادة كلمة المرور بالضغط على "تسجيل الدخول" ثم اختيار "نسيت كلمة المرور". سنرسل لك رابطاً عبر البريد الإلكتروني لتعيين كلمة مرور جديدة.',
      category: 'تقنية'
    }
  ];

  // فلترة الأسئلة
  filteredFaqs = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const category = this.activeCategory();

    return this.allFaqs.filter(faq => {
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
