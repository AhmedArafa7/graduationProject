import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-map',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './search-map.component.html',
  styleUrl: './search-map.component.scss'
})
export class SearchMapComponent {
  searchQuery = signal('القاهرة');
  hoveredPropertyId = signal<number | null>(null);

  // بيانات العقارات مع إحداثيات وهمية (top/left) للمحاكاة
  properties = [
    {
      id: 1,
      title: 'فيلا حديثة بإطلالة على النيل',
      location: 'الزمالك، القاهرة',
      price: '15,000,000',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAA6ht3FvXHzptUVFlnFb2xyJ9_5EdAVtWpG-zs33R1rLLKlTGNOfb-K8i6AKmXUDPm2F2jBK99LkrY5Vh5jXhNfBpTk9STvu9lLrcMVmtXteXOBvcdSdaYHkqZqwEY431vxg2by8aLGiqtpXTTCUbFOnzb-7EW1eCmPR59FHD6vPjmfosD13KrsyMiFCHjxm0kXAaMu40Rt1IQCDNnRHlFIiu4Arz1Wu4F-dFvtSE68MxPJYLED99inARWhZVNj3DY3lT3rKDEmJU',
      beds: 4,
      baths: 5,
      area: 500,
      mapPosition: { top: '35%', left: '55%' }
    },
    {
      id: 2,
      title: 'شقة مريحة في وسط البلد',
      location: 'وسط البلد، القاهرة',
      price: '3,200,000',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYZW2y7Ohh_U4RJL1jVPg6L9_mzb-HRrsC03Sv_djSJtIi1-QcrnGxiUTlZ4AI9AUw7llEnLtJwoNNlzpnAmBqSLItA7m1GIHOJbfQTLEU99YPdlT4o-PJvJ6iqQkpWWoZRld4mHqsHNwWm7_AfhuHQWybK_ZIJlM_m2Rsiob2PNlPlaYJDkF2RzDUyT_eqOsVhdtsSiYxEFcK9Mh6TK062p87V7pBDzoNgi-uAu_Xsf0Xoe4GgjuQNaXb1vVlhqKyjUmOIxkS-DI',
      beds: 2,
      baths: 2,
      area: 150,
      mapPosition: { top: '50%', left: '65%' }
    },
    {
      id: 3,
      title: 'شقة في التجمع الخامس',
      location: 'التجمع الخامس، القاهرة',
      price: '5,500,000',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-mZP3iqqtk8FxMuWVgdt8Dlt1u0_EY18NmT5D32pR6VEgOZ9F2LtjucJ4Am1bdRJzwwsBDPweWuO1GVJN6J81NIK36Lver20JcsB-R3chWlAevm2hLMA3xBcrU8Z-Hv71VttUrjKW_SErng4hzeTRDFZwxHcQREsg-hKfraWevQPd0M0coK8Y6GXWA53pBkCcveg4fKxHvJ4EwYuwFXIfJbRBor8r7_Y954Y4no1ess6Lol1mtkbeDvKqbef_NKst7Xe-5EwJml8',
      beds: 3,
      baths: 3,
      area: 210,
      mapPosition: { top: '65%', left: '80%' }
    },
    {
      id: 4,
      title: 'بنتهاوس في الشيخ زايد',
      location: 'الشيخ زايد، الجيزة',
      price: '8,900,000',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkW4pZoNmTD4XK2IkngG114JKQY718qSsH1Lmj68oMZ84veTH4wYyc8Wbo5FeA2RlOsSUiR2de2g2ZrlJIWrkTCIoD9z5mwIPgXTsWOn_xP9yhrbpIpP1u--k6-g_iIxV88BkcKOvgTr8BnDs68Si-sJs9_y1b_Mj8Aj1Y3xUYADSgOe1FscjwJhOWmfXWLgUtr_Gy8yu_hQu6RfP1IS57GE9s1lk96M-Juw30bbdjGmvLvdFCrnu95AsoQJKg5n2r61rOro_be2w',
      beds: 4,
      baths: 5,
      area: 350,
      mapPosition: { top: '60%', left: '20%' }
    }
  ];

  // تفاعل عند الوقوف على الكارت
  onCardHover(id: number | null) {
    this.hoveredPropertyId.set(id);
  }
}