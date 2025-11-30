import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-blog-list',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './blog-list.component.html',
  styleUrl: './blog-list.component.scss'
})
export class BlogListComponent {
  searchQuery = signal('');
  selectedCategory = signal('الكل');
  isLoading = signal(true); // حالة التحميل
  
  // بيانات وهمية للعرض (Filtered Posts)
  displayedPosts = signal<any[]>([]);

  // البيانات الأصلية
  private allPosts = [
    {
      id: 2,
      title: 'توقعات سوق العقارات المصري لعام 2024',
      excerpt: 'نظرة على مستقبل أسعار العقارات والفرص الاستثمارية في جميع أنحاء البلاد مع تحليل للخبراء.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBp9T9IAq4ZQtSFL7ow3c151nb9xRTrN2JvmNpnJXAQ8EbaK59USpz5KWNCSe1rpP7Oyxb-LbXPe5ADHC7eQApd-SZlZT6pwUADOLcYwWJynS1sDLefgMSyCTx61yRkwbYBFnAGILWVuhBjhSkt0pY6EkYy90ao1-Tw3pxd48vHeYRgo-94yMYblqY5taAxUlZb2pTBEjZKd-KJCngtTo3JxuVPPM9q0RlE9fxVPmMBKdMBAw_z5gZu8qNxbJUO_c5SU4ULCB1Dziw',
      author: 'فاطمة السيد',
      authorImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvt-WinbKTr2S1vGCdERUQ-NZ2ODYg8c7wMV2q4kI4p7MUt-hi6hetjPQBSZBeGOE07tRRaUQpqzBf_2cBt052YMco6nihV-taJUuF5JmDtNiLVA-HamkTcczsWpPeaHCivXC1YYF8eDubsOalOXO7j5tjchfdzsc9lUV-KWR0v2f-ArEC8GQGS8Eh4CtSgqGXoeh-d4KJPEIaVolHRkDWVigj2TUTNMjXNeG62H-Av4a_ngxa24e5z1QRt5ljXht_qN1nBEvf9lI',
      views: '1.2k',
      date: '18 أغسطس 2023',
      readTime: '5 دقائق',
      category: 'أخبار السوق',
      catColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
    },
    {
      id: 3,
      title: '5 نصائح ذهبية لتجهيز منزلك لبيع سريع وبأعلى سعر',
      excerpt: 'تعلم كيف تجعل عقارك لا يقاوم للمشترين المحتملين من خلال نصائح التجهيز البسيطة وغير المكلفة.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7VNVAYDip4KoyRRlAjYHS2bKryTspimtQwOWw6cQDj3NNlDhw9td8Hd8_5j7IIM0vEyMvMMKVpca7mqFO3Gm0xEdiaxQKs3FY5S-8HZnHscAVAI6ARJHG2mL1lUys6G9gaOn6_9wwgk0NALkOsKpsWTkYQw8UiFbcUjvLajvu-SdETS45ayzldvS5knoiAo-kcX9b6RnGftGvjMPBp5ZpNZvq8n81Z-DEf1BKxIu_G5oa76jA1vN9NA4UQYzguHIh4aVHpKlNgbc',
      author: 'يوسف علي',
      authorImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkLFu_xwKsRV6IczQ79lv0Ulkxa0bR9D4jsvEiS0gEnhPjiT095S6LPk9g-yFhk-OkcE4_bVk2cUQ2TZ4XsXskPrGyOSVSH5nJ6mz-W8avarU5sl5HxxYDXdoqvxY9SzlWu_RdL2j5lYRr9J01J4meE7mlomVhCAZ38_Np4KmdufEsABrpU98L95CiTigP_QpYvUMwHsFjYkOR0chKk0wOu1z_YRZQwt1j-Ew-iVlJ-8D5n34VWXE8wVreM_D-QHHH2kONb1mg_Vo',
      views: '980',
      date: '10 أغسطس 2023',
      readTime: '4 دقائق',
      category: 'نصائح للبائعين',
      catColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
    },
    {
      id: 4,
      title: 'الساحل الشمالي: وجهة الصيف والاستثمار الأولى',
      excerpt: 'اكتشف أفضل الكمبوندات وأماكن نمط الحياة في الساحل الشمالي لمنزل عطلتك القادم.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDz7L5zm5Q4j2VSj_lU3ZvAPpMqAhsjay_HiOf2840mxo70jCtITE3hTWeXJEoTELKdfPxRY7O3OlYuGmZU6o_Q8hWX3V-Y7phq2qLbQg9rwrwwW3WhyvhzTA5KS0ZnNZ9X57vImCHtfX4C-3pOXMYCwmoSKLJD-CfMU0lk14B78NreGcLR8ejBXYqYhs_uPk4ZzbkE0AMIQmAJ5PX_BsVU5yOvh9t_bFDoRjlKA_RfpuMfhy-tYFFl1ZNZvRCEy-WolXSQdrMyPzY',
      author: 'ليلى حسن',
      authorImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzy9GMprn0dAMnqhW34a1OTVe5wp-UCkj6JsTRxdCTcQl_1VUJfpxAK8NH4hNmmB-TTCiW-h5fN-aaZRPBeOLAskIwkNz91X21V9oDjN-zdZWyPKBmzeZXyHHYwv6pd2-sFfmyq36a9m8MTO079NdfI8IRpUwC6D3I_hivl1obfSUglcY3Nh9QroFMErlCNuk9pM2rJruedh_pocHDa3-wu4viCm9OhRYAxfz-dAtr-nyJcToik33I9pyK57Q90mfJxbkyF1kL6yc',
      views: '2.5k',
      date: '05 أغسطس 2023',
      readTime: '7 دقائق',
      category: 'دليل المناطق',
      catColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
    },
     {
      id: 5,
      title: 'كيف تختار الرهن العقاري المناسب لميزانيتك؟',
      excerpt: 'دليل شامل للمبتدئين حول أنواع التمويل العقاري المتاحة في مصر وكيفية التقديم.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA08VJReyUi80_dA-mF22ehd8zMckQwH3iHuo6eKsWDgXzeh3KcOIA4YO0Sfn4Wla61OO-2fldbcL6ZPSDuYMDZzE8QPIkNwGMBbJZVwW4Yuz8t9X-yLR3euKZ0qihjB0OyeVu49DBX16BXbzpmNbmOrsr0wtaIp_zBm8_RqNC73CMvvwig-WoHU77MqgZC85k3R4yOO40mwUF0H-vQxjnlOCj7QdUqChimBfFKrKdoRDsPduHoyGfcDfnTIBID2BflBK-ubLC1Xr0',
      author: 'محمود جمال',
      authorImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXKKhZnI1lqh5VNBIJy4ZNBnRrdcl85dlU9v2GsUGOiRp4WkX19wLDcejm1XeotfdLDH7EumSa7nxmYRUqZltP9bBwo19Os-scEcBGpYXPjZ5CU3I-BBXKjflSs_hUghKu8ar8PX0dYkxnuHGDE7SrIoEHrga9yLZ1CSoCqHLT5T2gUOisgKmLykWUh2ozAGqJipHUAjM2ABKuSnakZxqxlWT3tfjQk3fhngFzjnIBfEZRa_T2op1jbfyDWo7wAv6bZL2FU8yMHj0',
      views: '1.8k',
      date: '01 أغسطس 2023',
      readTime: '6 دقائق',
      category: 'استثمار عقاري',
      catColor: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
    }
  ];

  categories = ['الكل', 'نصائح للمشترين', 'نصائح للبائعين', 'استثمار عقاري', 'أخبار السوق', 'دليل المناطق'];

  // المقال المميز
  featuredPost = {
    id: 1,
    title: 'الدليل الشامل لشراء منزلك الأول في القاهرة',
    excerpt: 'دليل متعمق يغطي كل ما تحتاج لمعرفته حول شراء عقار في عاصمة مصر المزدحمة، من التمويل إلى الإجراءات القانونية.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIZoUHFV0r0EuiYIjEzrVgzDSiNEIlbhp34g6HvR6gisi0C3LCDmccg6QdT8FHMDAxBb5jRjbUNy7c11CnVLECsdfOBDUJoO_5kxhoDiW3bPj3UKCBuVaZnyZuLNGFV-UmUviVEzQANjClvpe3dyA8zBIQulULqZRivLYR0Va7OsU01dOTf6JI6wBcIDdPx58TVDkQuaK_rhgJ0xVZinQ_pcVW5ccgdPLO0c6UitHdld9MgPLLEjfFMF1yDdVmGWiSoBtwzpho5n4',
    author: 'أحمد محمود',
    authorImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWoZo3Er-RwwLqmukbEH6St2WRmn6QgBpD-HwwlzLSRHx5gIDb_nxkRTO0kEEOW8JmPIoXMhYfxBWrF0F6zu7SSnLOIq3LLnoTasgjAcDUq-PXso52v_4ckYf4n6DXbg84qEeG860sM-Jp3tnFaUCOg-l0VFX_nFTkpnOaTJq1puTPTXriTVh3qGaY3SBbn2KpQlGx-tf9_H5YrLplCBT-DedqXX_c1U6iRvlz4Zvn8zq__w6YDGhXYEJQdeeGEyIikiyZA2FszmU',
    date: '26 أكتوبر 2023',
    readTime: '8 دقائق',
    category: 'نصائح للمشترين'
  };

  popularPosts = [
    { id: 1, title: 'الدليل الشامل لشراء منزلك الأول', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkPEaO0CTCUtwJYKdga1RWY5LCWQojEkfF7S2RiCkSXVoTTPNp4kykS63HwM9v0SUwQWZUPRC7unzQ-BZkhTg1mOUDJ14JsZ7wJvyIT2QNfhvgMkvxattVy9ujFiHZYYSaApeeu1atHBvkzAJpAQ8aR8stFMv6kn1Sl-LljQ3E1l8m6j4QYA1k0faipEj3Oy_xkFAvy_iy8JY4Lke4GOqLGiGGvMo1jplsa-rMlElYcVJ-kbYrTWzcZR26ChRJkT7P-Za4LNhwZ64', date: '26 Oct' },
    { id: 4, title: 'الساحل الشمالي: وجهة الصيف الأولى', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUTjtlZ7GY-cdKAIpmCuxiBn1FZV2Lk78acMGYxL8eupQa1oxQhaOtGNurXekLYKJqbeb_h1IS6grOCfnCoTQPgTrypq6r8G9167sXWuMAd3s3-_DGiNu1QyVuAvQyR_LeOHoZ87hpjmJAU6C-1UphKx95ZXxYEItJp8fWV_7seljHqpCB5aB5eeFUIdCnVBSG3Cm-su03rDoK23NoIna7UrcSQ-O1WPK5ftWke6Ib8vPpVLVfjBkJK6MgMWezzRvOVi_umsorLk0', date: '05 Aug' },
    { id: 2, title: 'توقعات سوق العقارات 2024', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA08VJReyUi80_dA-mF22ehd8zMckQwH3iHuo6eKsWDgXzeh3KcOIA4YO0Sfn4Wla61OO-2fldbcL6ZPSDuYMDZzE8QPIkNwGMBbJZVwW4Yuz8t9X-yLR3euKZ0qihjB0OyeVu49DBX16BXbzpmNbmOrsr0wtaIp_zBm8_RqNC73CMvvwig-WoHU77MqgZC85k3R4yOO40mwUF0H-vQxjnlOCj7QdUqChimBfFKrKdoRDsPduHoyGfcDfnTIBID2BflBK-ubLC1Xr0', date: '18 Aug' }
  ];

  constructor() {
    // محاكاة تحميل البيانات من API
    setTimeout(() => {
      this.displayedPosts.set(this.allPosts);
      this.isLoading.set(false);
    }, 1500);

    // تأثير لتصفية النتائج عند البحث
    effect(() => {
      const query = this.searchQuery().toLowerCase();
      const cat = this.selectedCategory();

      this.displayedPosts.set(
        this.allPosts.filter(post => {
          const matchesSearch = post.title.toLowerCase().includes(query) || post.excerpt.toLowerCase().includes(query);
          const matchesCat = cat === 'الكل' || post.category === cat;
          return matchesSearch && matchesCat;
        })
      );
    });
  }

  setCategory(cat: string) {
    this.selectedCategory.set(cat);
  }
}