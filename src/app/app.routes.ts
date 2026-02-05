import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
  // 1. الصفحات العامة (Public Pages) - تستخدم التصميم الرئيسي
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      // الصفحة الرئيسية
      { 
        path: '', 
        title: 'Baytology.ai - الرئيسية',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) 
      },
      // صفحة "قريباً" (Landing Page)
      { 
        path: 'coming-soon', 
        title: 'قريباً',
        loadComponent: () => import('./pages/general/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent) 
      },
      // نتائج البحث (نسخة القائمة ونسخة الخريطة)
      { 
        path: 'search', 
        title: 'بحث العقارات',
        loadComponent: () => import('./pages/search/search-list/search-list.component').then(m => m.SearchListComponent) // search_results_page_2
      },
      { 
        path: 'search/map', 
        title: 'بحث العقارات - الخريطة',
        loadComponent: () => import('./pages/search/search-map/search-map.component').then(m => m.SearchMapComponent) // search_results_page_1
      },
      // تفاصيل العقار
      { 
        path: 'property/:id', 
        title: 'تفاصيل العقار',
        loadComponent: () => import('./pages/property/property-details/property-details.component').then(m => m.PropertyDetailsComponent) 
      },
      // الوكلاء
      { 
        path: 'agents', 
        title: 'الوكلاء العقاريين',
        loadComponent: () => import('./pages/agents/agents-list/agents-list.component').then(m => m.AgentsListComponent) // all_agents_listing_page & agents_page
      },
      { 
        path: 'agent/:id', 
        title: 'ملف الوكيل',
        loadComponent: () => import('./pages/agents/agent-profile/agent-profile.component').then(m => m.AgentProfileComponent) 
      },
      // المدونة
      { 
        path: 'blog', 
        title: 'المدونة',
        loadComponent: () => import('./pages/blog/blog-list/blog-list.component').then(m => m.BlogListComponent) // blog_faq_page
      },
      { 
        path: 'blog/:slug', 
        title: 'تفاصيل المقال',
        loadComponent: () => import('./pages/blog/blog-details/blog-details.component').then(m => m.BlogDetailsComponent) // blog_post_single_page
      },
      // صفحات المعلومات والاتصال
      { 
        path: 'about', 
        title: 'من نحن',
        loadComponent: () => import('./pages/general/about/about.component').then(m => m.AboutComponent) 
      },
      { 
        path: 'contact', 
        title: 'اتصل بنا',
        loadComponent: () => import('./pages/general/contact/contact.component').then(m => m.ContactComponent) 
      },
      { 
        path: 'faq', 
        title: 'الأسئلة الشائعة',
        loadComponent: () => import('./pages/general/faq/faq.component').then(m => m.FaqComponent) 
      },
      { 
        path: 'privacy-policy', 
        title: 'سياسة الخصوصية',
        loadComponent: () => import('./pages/general/privacy/privacy.component').then(m => m.PrivacyComponent) 
      },
      { 
        path: 'terms', 
        title: 'شروط الخدمة',
        loadComponent: () => import('./pages/general/terms/terms.component').then(m => m.TermsComponent) 
      },
      { 
        path: 'sitemap', 
        title: 'خريطة الموقع',
        loadComponent: () => import('./pages/general/sitemap/sitemap.component').then(m => m.SitemapComponent) 
      },
    ]
  },

  // 2. صفحات لوحة التحكم (Dashboard Pages) - بدون الهيدر الرئيسي، مع Sidebar
  // صفحة الملف الشخصي
  { 
    path: 'profile', 
    title: 'ملفي الشخصي',
    loadComponent: () => import('./pages/user/profile/profile.component').then(m => m.ProfileComponent) 
  },
  // لوحة تحكم الوكيل
  { 
    path: 'agent-dashboard', 
    title: 'لوحة تحكم الوكيل',
    loadComponent: () => import('./pages/agent/agent-dashboard/agent-dashboard.component').then(m => m.AgentDashboardComponent) 
  },
  // إضافة عقار جديد
  { 
    path: 'add-property', 
    title: 'إضافة عقار جديد',
    loadComponent: () => import('./pages/agent/add-property/add-property.component').then(m => m.AddPropertyComponent) 
  },
  // تعديل عقار
  { 
    path: 'edit-property/:id', 
    title: 'تعديل العقار',
    loadComponent: () => import('./pages/agent/edit-property/edit-property.component').then(m => m.EditPropertyComponent) 
  },
  // صفحة الرسائل
  { 
    path: 'messages', 
    title: 'رسائلي',
    loadComponent: () => import('./pages/user/messages/messages.component').then(m => m.MessagesComponent) 
  },
  // صفحة المفضلة
  { 
    path: 'favorites', 
    title: 'المفضلة',
    loadComponent: () => import('./pages/user/favorites/favorites.component').then(m => m.FavoritesComponent) 
  },
  // صفحة الإشعارات
  { 
    path: 'notifications', 
    title: 'الإشعارات',
    loadComponent: () => import('./pages/user/notifications/notifications.component').then(m => m.NotificationsComponent) 
  },

  // 3. صفحات المصادقة (Auth Pages) - بدون الهيدر الرئيسي
  {
    path: 'auth',
    children: [
      { 
        path: 'login', 
        title: 'تسجيل الدخول',
        loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent) 
      },
      { 
        path: 'signup', 
        title: 'إنشاء حساب',
        loadComponent: () => import('./pages/auth/signup/signup.component').then(m => m.SignupComponent) 
      },
      { 
        path: 'forgot-password', 
        title: 'نسيت كلمة المرور',
        loadComponent: () => import('./pages/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) 
      }
    ]
  },



  // 4. لوحة تحكم الأدمن (Admin Dashboard) - Layout منفصل
  { 
    path: 'admin/dashboard', 
    title: 'لوحة تحكم المشرف',
    loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then(m => m.DashboardComponent) 
  },


  // 5. صفحة الخطأ (404)
  { 
    path: '**', 
    title: 'صفحة غير موجودة',
    loadComponent: () => import('./pages/general/not-found/not-found.component').then(m => m.NotFoundComponent) // 404_error_page
  }
];