import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  searchType: 'buy' | 'rent' = 'buy';

  setSearchType(type: 'buy' | 'rent') {
    this.searchType = type;
  }

  // العقارات المميزة
  featuredProperties = [
    {
      id: 1,
      title: 'فيلا مودرن في التجمع الخامس',
      location: 'القاهرة الجديدة، القاهرة',
      price: '12,000,000',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAA6ht3FvXHzptUVFlnFb2xyJ9_5EdAVtWpG-zs33R1rLLKlTGNOfb-K8i6AKmXUDPm2F2jBK99LkrY5Vh5jXhNfBpTk9STvu9lLrcMVmtXteXOBvcdSdaYHkqZqwEY431vxg2by8aLGiqtpXTTCUbFOnzb-7EW1eCmPR59FHD6vPjmfosD13KrsyMiFCHjxm0kXAaMu40Rt1IQCDNnRHlFIiu4Arz1Wu4F-dFvtSE68MxPJYLED99inARWhZVNj3DY3lT3rKDEmJU',
      beds: 5,
      baths: 6,
      area: 450,
      tag: 'مقترح لك'
    },
    {
      id: 2,
      title: 'شقة بإطلالة على النيل',
      location: 'الزمالك، القاهرة',
      price: '5,500,000',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYZW2y7Ohh_U4RJL1jVPg6L9_mzb-HRrsC03Sv_djSJtIi1-QcrnGxiUTlZ4AI9AUw7llEnLtJwoNNlzpnAmBqSLItA7m1GIHOJbfQTLEU99YPdlT4o-PJvJ6iqQkpWWoZRld4mHqsHNwWm7_AfhuHQWybK_ZIJlM_m2Rsiob2PNlPlaYJDkF2RzDUyT_eqOsVhdtsSiYxEFcK9Mh6TK062p87V7pBDzoNgi-uAu_Xsf0Xoe4GgjuQNaXb1vVlhqKyjUmOIxkS-DI',
      beds: 3,
      baths: 2,
      area: 210,
      tag: 'مميز'
    },
    {
      id: 3,
      title: 'تاون هاوس في الشيخ زايد',
      location: 'الشيخ زايد، الجيزة',
      price: '3,200,000',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-mZP3iqqtk8FxMuWVgdt8Dlt1u0_EY18NmT5D32pR6VEgOZ9F2LtjucJ4Am1bdRJzwwsBDPweWuO1GVJN6J81NIK36Lver20JcsB-R3chWlAevm2hLMA3xBcrU8Z-Hv71VttUrjKW_SErng4hzeTRDFZwxHcQREsg-hKfraWevQPd0M0coK8Y6GXWA53pBkCcveg4fKxHvJ4EwYuwFXIfJbRBor8r7_Y954Y4no1ess6Lol1mtkbeDvKqbef_NKst7Xe-5EwJml8',
      beds: 4,
      baths: 3,
      area: 280,
      tag: 'جديد'
    },
    {
      id: 4,
      title: 'شاليه في الساحل الشمالي',
      location: 'الساحل الشمالي',
      price: '2,800,000',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkW4pZoNmTD4XK2IkngG114JKQY718qSsH1Lmj68oMZ84veTH4wYyc8Wbo5FeA2RlOsSUiR2de2g2ZrlJIWrkTCIoD9z5mwIPgXTsWOn_xP9yhrbpIpP1u--k6-g_iIxV88BkcKOvgTr8BnDs68Si-sJs9_y1b_Mj8Aj1Y3xUYADSgOe1FscjwJhOWmfXWLgUtr_Gy8yu_hQu6RfP1IS57GE9s1lk96M-Juw30bbdjGmvLvdFCrnu95AsoQJKg5n2r61rOro_be2w',
      beds: 2,
      baths: 1,
      area: 120,
      tag: 'فرصة'
    }
  ];

  // أفضل الوكلاء
  topAgents = [
    { name: 'أحمد ماهر', rating: 4.9, propertiesCount: 120, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwsPA9c31HBt2vXqoZ00tYJx2RIr9cHIYSdSmV9fxvyKziuR0dz2LFsmx8OhGV1sL_n1Yus1lK9363sWb3gWqUfBbpIXA0sDejx5rBJljOwbQ0S3ekK6IeiRe8jm7282x_rMXb30iaeN7mvFh8bZf5SFkOieg4XzCetPe68ao1xbc4A8Owyu8nGpmsWyu0LTbZ-ykOto0Zi0JbclcntcDQ-T4WpLwji4G5tthQ94W4E8o0T0e-2F-I27Cc1qsq9sVbNp4JH8m3tZs' },
    { name: 'فاطمة السيد', rating: 4.8, propertiesCount: 95, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwsPA9c31HBt2vXqoZ00tYJx2RIr9cHIYSdSmV9fxvyKziuR0dz2LFsmx8OhGV1sL_n1Yus1lK9363sWb3gWqUfBbpIXA0sDejx5rBJljOwbQ0S3ekK6IeiRe8jm7282x_rMXb30iaeN7mvFh8bZf5SFkOieg4XzCetPe68ao1xbc4A8Owyu8nGpmsWyu0LTbZ-ykOto0Zi0JbclcntcDQ-T4WpLwji4G5tthQ94W4E8o0T0e-2F-I27Cc1qsq9sVbNp4JH8m3tZs' },
    { name: 'يوسف علي', rating: 4.8, propertiesCount: 88, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwsPA9c31HBt2vXqoZ00tYJx2RIr9cHIYSdSmV9fxvyKziuR0dz2LFsmx8OhGV1sL_n1Yus1lK9363sWb3gWqUfBbpIXA0sDejx5rBJljOwbQ0S3ekK6IeiRe8jm7282x_rMXb30iaeN7mvFh8bZf5SFkOieg4XzCetPe68ao1xbc4A8Owyu8nGpmsWyu0LTbZ-ykOto0Zi0JbclcntcDQ-T4WpLwji4G5tthQ94W4E8o0T0e-2F-I27Cc1qsq9sVbNp4JH8m3tZs' },
    { name: 'نور حسن', rating: 4.7, propertiesCount: 82, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwsPA9c31HBt2vXqoZ00tYJx2RIr9cHIYSdSmV9fxvyKziuR0dz2LFsmx8OhGV1sL_n1Yus1lK9363sWb3gWqUfBbpIXA0sDejx5rBJljOwbQ0S3ekK6IeiRe8jm7282x_rMXb30iaeN7mvFh8bZf5SFkOieg4XzCetPe68ao1xbc4A8Owyu8nGpmsWyu0LTbZ-ykOto0Zi0JbclcntcDQ-T4WpLwji4G5tthQ94W4E8o0T0e-2F-I27Cc1qsq9sVbNp4JH8m3tZs' },
    { name: 'مريم عادل', rating: 4.7, propertiesCount: 75, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwsPA9c31HBt2vXqoZ00tYJx2RIr9cHIYSdSmV9fxvyKziuR0dz2LFsmx8OhGV1sL_n1Yus1lK9363sWb3gWqUfBbpIXA0sDejx5rBJljOwbQ0S3ekK6IeiRe8jm7282x_rMXb30iaeN7mvFh8bZf5SFkOieg4XzCetPe68ao1xbc4A8Owyu8nGpmsWyu0LTbZ-ykOto0Zi0JbclcntcDQ-T4WpLwji4G5tthQ94W4E8o0T0e-2F-I27Cc1qsq9sVbNp4JH8m3tZs' },
    { name: 'خالد إبراهيم', rating: 4.6, propertiesCount: 68, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwsPA9c31HBt2vXqoZ00tYJx2RIr9cHIYSdSmV9fxvyKziuR0dz2LFsmx8OhGV1sL_n1Yus1lK9363sWb3gWqUfBbpIXA0sDejx5rBJljOwbQ0S3ekK6IeiRe8jm7282x_rMXb30iaeN7mvFh8bZf5SFkOieg4XzCetPe68ao1xbc4A8Owyu8nGpmsWyu0LTbZ-ykOto0Zi0JbclcntcDQ-T4WpLwji4G5tthQ94W4E8o0T0e-2F-I27Cc1qsq9sVbNp4JH8m3tZs' }
  ];

  // آراء العملاء
  testimonials = [
    {
      name: 'حسن مصطفى',
      date: '15 أغسطس 2023',
      rating: 5,
      text: "تجربة البحث بالذكاء الاصطناعي كانت مذهلة! وصفت الشقة التي أحلم بها ووجد لي النظام خيارات ممتازة في ثوانٍ.",
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwsPA9c31HBt2vXqoZ00tYJx2RIr9cHIYSdSmV9fxvyKziuR0dz2LFsmx8OhGV1sL_n1Yus1lK9363sWb3gWqUfBbpIXA0sDejx5rBJljOwbQ0S3ekK6IeiRe8jm7282x_rMXb30iaeN7mvFh8bZf5SFkOieg4XzCetPe68ao1xbc4A8Owyu8nGpmsWyu0LTbZ-ykOto0Zi0JbclcntcDQ-T4WpLwji4G5tthQ94W4E8o0T0e-2F-I27Cc1qsq9sVbNp4JH8m3tZs'
    },
    {
      name: 'سلمى أحمد',
      date: '22 يوليو 2023',
      rating: 4.5,
      text: "الوكيل الذي تواصلت معه كان محترفاً جداً ويعرف منطقة التجمع جيداً. شكراً Baytology.",
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwsPA9c31HBt2vXqoZ00tYJx2RIr9cHIYSdSmV9fxvyKziuR0dz2LFsmx8OhGV1sL_n1Yus1lK9363sWb3gWqUfBbpIXA0sDejx5rBJljOwbQ0S3ekK6IeiRe8jm7282x_rMXb30iaeN7mvFh8bZf5SFkOieg4XzCetPe68ao1xbc4A8Owyu8nGpmsWyu0LTbZ-ykOto0Zi0JbclcntcDQ-T4WpLwji4G5tthQ94W4E8o0T0e-2F-I27Cc1qsq9sVbNp4JH8m3tZs'
    },
    {
      name: 'عمر خالد',
      date: '05 يونيو 2023',
      rating: 5,
      text: "كنت قلقاً كوني مشتري لأول مرة، لكن الموقع سهل عليّ كل الخطوات من البحث وحتى التعاقد.",
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwsPA9c31HBt2vXqoZ00tYJx2RIr9cHIYSdSmV9fxvyKziuR0dz2LFsmx8OhGV1sL_n1Yus1lK9363sWb3gWqUfBbpIXA0sDejx5rBJljOwbQ0S3ekK6IeiRe8jm7282x_rMXb30iaeN7mvFh8bZf5SFkOieg4XzCetPe68ao1xbc4A8Owyu8nGpmsWyu0LTbZ-ykOto0Zi0JbclcntcDQ-T4WpLwji4G5tthQ94W4E8o0T0e-2F-I27Cc1qsq9sVbNp4JH8m3tZs'
    }
  ];

  // أحدث المقالات
  latestPosts = [
    {
      id: 1,
      title: '5 نصائح مهمة عند شراء أول منزل لك',
      category: 'نصائح',
      excerpt: 'تعرف على أهم النصائح التي يجب مراعاتها عند اتخاذ قرار شراء منزلك الأول...',
      author: 'ندى محمود',
      date: '20 أغسطس 2023',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDivc04Chja-iahtaYwiIDetoVAtqoGdHCNesE7-DFx9NRNGm-_uVNdbYyuohM0rf3yil8pF6cH30p0erAwVBFWq5E3NXnxTeBNPJEreL4wXdL3XHWiXZQIVWipLrAE1kH9YEFIrLblSZf76gF3aqRzkEs9aZvHVvNw5OWugQ-daSPzr00RIPosKE_OdVSp8cmniTUGuHp2qMJdr_9I8g9uISKhbscEgXMt3jWa5Q8UWtH8tXvb3Cknktff0V56H3tLdIdH5B_wkJo'
    },
    {
      id: 2,
      title: 'مستقبل العقارات في العاصمة الإدارية',
      category: 'تحليل السوق',
      excerpt: 'تحليل شامل لاتجاهات سوق العقارات في العاصمة الإدارية والفرص الاستثمارية...',
      author: 'فريق Baytology',
      date: '18 أغسطس 2023',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDivc04Chja-iahtaYwiIDetoVAtqoGdHCNesE7-DFx9NRNGm-_uVNdbYyuohM0rf3yil8pF6cH30p0erAwVBFWq5E3NXnxTeBNPJEreL4wXdL3XHWiXZQIVWipLrAE1kH9YEFIrLblSZf76gF3aqRzkEs9aZvHVvNw5OWugQ-daSPzr00RIPosKE_OdVSp8cmniTUGuHp2qMJdr_9I8g9uISKhbscEgXMt3jWa5Q8UWtH8tXvb3Cknktff0V56H3tLdIdH5B_wkJo'
    },
    {
      id: 3,
      title: 'أفكار ديكور حديثة للمساحات الصغيرة',
      category: 'ديكور',
      excerpt: 'استلهم أفكارًا ذكية وعصرية لتحقيق أقصى استفادة من المساحات الصغيرة...',
      author: 'سارة علي',
      date: '15 أغسطس 2023',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDivc04Chja-iahtaYwiIDetoVAtqoGdHCNesE7-DFx9NRNGm-_uVNdbYyuohM0rf3yil8pF6cH30p0erAwVBFWq5E3NXnxTeBNPJEreL4wXdL3XHWiXZQIVWipLrAE1kH9YEFIrLblSZf76gF3aqRzkEs9aZvHVvNw5OWugQ-daSPzr00RIPosKE_OdVSp8cmniTUGuHp2qMJdr_9I8g9uISKhbscEgXMt3jWa5Q8UWtH8tXvb3Cknktff0V56H3tLdIdH5B_wkJo'
    }
  ];
}