import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  imports: [CommonModule, RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  
  // قيم الشركة
  values = [
    {
      icon: 'lightbulb',
      title: 'الابتكار',
      description: 'نحن ندفع باستمرار حدود الممكن في التكنولوجيا العقارية لتقديم أفضل الحلول لعملائنا.'
    },
    {
      icon: 'verified_user',
      title: 'الشفافية',
      description: 'نؤمن بالشفافية الكاملة. نوفر بيانات دقيقة وغير متحيزة لمساعدتك على اتخاذ قرارات مستنيرة.'
    },
    {
      icon: 'groups',
      title: 'التركيز على العميل',
      description: 'احتياجاتك هي أولويتنا. نحن نصمم كل جانب من جوانب منصتنا مع وضعك في الاعتبار.'
    }
  ];

  // إحصائيات
  stats = [
    { value: '10,000+', label: 'عقار مدرج' },
    { value: '5,000+', label: 'عميل سعيد' },
    { value: '1,500+', label: 'صفقة ناجحة' }
  ];

  // فريق العمل
  team = [
    {
      name: 'أحمد عرفه',
      role: 'المؤسس والرئيس التنفيذي',
      image: './Ahmed_Arafa.jpg',
    },
    {
      name: 'عبد الرحمن عطية',
      role: 'رئيسة قسم التكنولوجيا',
      image: './Abdul_Rahman_Attia.png',
    },
    {
      name: 'يوسف الدغيدي',
      role: 'مدير المنتج',
      image: './Yousef_Eldegedy.png',
    },
    {
      name: 'أحمد هشام',
      role: 'رئيسة قسم التسويق',
      image: './Ahmed_Hesham.png',
    },
        {
      name: 'عمر البلتاجى',
      role: 'رئيسة قسم التسويق',
      image: './Omar_Elpeltage.png',
    },
        {
      name: 'سعد السيد',
      role: 'رئيسة قسم التسويق',
      image: './Saad_Elsayed.png',
    }
  ];

  // شركاء النجاح (صور وهمية)
  partners = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCwCPdKCBC_C0VGP2StjtbYjKKDVPDcVaUKQ9YzgKDModdfaYNYYDDiqHZ4zxPoCOHJkl6XWBEMg-OmL7aOvFwQOMveInk5XcRtyybzVlOycaewpgPqa4W1vNoo5N1EYn3wbuo_qg6cUdCr8mGLNA8HUHCNhObKodR_Gd8EwBrp313Hiy8A09Jv6Wc9dm_TV0KAsTB8plV9rUYXd-x2p3oAvIeSOO47NX26nck4lGjOTs6-Dzb7RMCtTfkwJbMXFYnwc_P8F8AVxKc',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBn7aPKkLBJR538E-748vqoTsK7YgGL6wS1NuB5-OahWS-LpHQIN5q2Qv78oMGUDAi9pawSmxnov6iFb9u_2iWEwqedoMhaihVLqh8BBTLK__3ZVYBXXqSX71FEI5XLyrtPn6QpXLFUYPv-ulmMawjd2qEvdJ6ny780ql0ZbvUnDVxjE6CWeVlUsfZ7X4mpdQhdVI_iULEluOnQVovw2qZhF913u7c_mRLW4n7o-LSE56D8HUsDOvMQ00KWo96LNcVCMN3L_tZTf3M',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAYqxqZ9wGwVb7QI1R0YORFUjnAg97vOp9X7tELxyZdi68YP9Oqdpht2B6tigauQs1aWVZxxT-5b7kS85KRg9Voe9tMZrSeDuraoG_Y1hiE9kIf_QFplpvTqITHe1qeebPR2EMblzj_5csorgGchqF85YwvMNYrwgNFuRrUfGqxmlME2SzHkWPuZ6EVQOpT1zY91i7Lz7nkvq2NdAR6RuHH6W_N-Q01n8WuL0_nsDjEqP3tunErbvMGBunmEjtp8r3asLW9hfk1ZBs',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDRswAyeyg_GFWug4xefwjFb-nh4VRLDg0HXwZi9oypuba0i9GzR8ahSbOM4gQRQpNXZOE0amauwh53tioBm9mY6MYGjavgUwTOEUDoWJk4MfXne49rbOEqq-CSD3V1jHtlYT1TK865lVrNGNFbA0BmW4D_f4lF4N2XvHXdvf2bvayKBkiSLhXqjEfbJfJQhlWzAZKI_LrF89JyPjTNBVdQeRg5dstTOmR2MG0xQvrlmmsMM7xFMAlQ7mz-rGp_WdmiN6X5C1QUDiM',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCCjoxPTphjeAsVT8NkORNjd9_feRxH9e5IGLM5wrgCc8Gv7Xna02kw6xZ7hQgJOG5_Sa6kneMzs5aYiy_NXlYWoZZiR9gQt5Sz1DIErFUOUGn2pg_CbmxZvatKthsPGGXkGX0sUpcdQtP4_Oscbvcdxlc2IdZ0WECrAOu9izbjQTJJgpu5Ggb7gca7tH7ptDRCS2lurdZjE_56pmmNKvQA7Ig07Uv_SrV6svEhZvtZFctOv91qt2jXxq-8qOh_iNB_3FQS7eDdgLM'
  ];
}