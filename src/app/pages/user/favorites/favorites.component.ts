import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GlobalStateService } from '../../../core/services/global-state.service';
import { AgentSidebarComponent } from '../../../shared/agent-sidebar/agent-sidebar.component';
 
// نفس بيانات صفحة البحث
const ALL_PROPERTIES = [ 
  {
    id: 1,
    title: 'فيلا حديثة بإطلالة على النيل',
    location: 'الزمالك، القاهرة',
    price: '15,000,000 جنيه',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAA6ht3FvXHzptUVFlnFb2xyJ9_5EdAVtWpG-zs33R1rLLKlTGNOfb-K8i6AKmXUDPm2F2jBK99LkrY5Vh5jXhNfBpTk9STvu9lLrcMVmtXteXOBvcdSdaYHkqZqwEY431vxg2by8aLGiqtpXTTCUbFOnzb-7EW1eCmPR59FHD6vPjmfosD13KrsyMiFCHjxm0kXAaMu40Rt1IQCDNnRHlFIiu4Arz1Wu4F-dFvtSE68MxPJYLED99inARWhZVNj3DY3lT3rKDEmJU',
    beds: 4,
    baths: 5,
    area: '500 م²',
    type: 'sale' as const
  },
  {
    id: 2,
    title: 'شقة مريحة في وسط البلد',
    location: 'وسط البلد، القاهرة',
    price: '3,200,000 جنيه',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYZW2y7Ohh_U4RJL1jVPg6L9_mzb-HRrsC03Sv_djSJtIi1-QcrnGxiUTlZ4AI9AUw7llEnLtJwoNNlzpnAmBqSLItA7m1GIHOJbfQTLEU99YPdlT4o-PJvJ6iqQkpWWoZRld4mHqsHNwWm7_AfhuHQWybK_ZIJlM_m2Rsiob2PNlPlaYJDkF2RzDUyT_eqOsVhdtsSiYxEFcK9Mh6TK062p87V7pBDzoNgi-uAu_Xsf0Xoe4GgjuQNaXb1vVlhqKyjUmOIxkS-DI',
    beds: 2,
    baths: 2,
    area: '150 م²',
    type: 'sale' as const
  },
  {
    id: 3,
    title: 'تاون هاوس في الشيخ زايد',
    location: 'الشيخ زايد، الجيزة',
    price: '8,500,000 جنيه',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-mZP3iqqtk8FxMuWVgdt8Dlt1u0_EY18NmT5D32pR6VEgOZ9F2LtjucJ4Am1bdRJzwwsBDPweWuO1GVJN6J81NIK36Lver20JcsB-R3chWlAevm2hLMA3xBcrU8Z-Hv71VttUrjKW_SErng4hzeTRDFZwxHcQREsg-hKfraWevQPd0M0coK8Y6GXWA53pBkCcveg4fKxHvJ4EwYuwFXIfJbRBor8r7_Y954Y4no1ess6Lol1mtkbeDvKqbef_NKst7Xe-5EwJml8',
    beds: 3,
    baths: 3,
    area: '280 م²',
    type: 'sale' as const
  },
  {
    id: 4,
    title: 'شاليه في العين السخنة',
    location: 'العين السخنة',
    price: '4,100,000 جنيه',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkW4pZoNmTD4XK2IkngG114JKQY718qSsH1Lmj68oMZ84veTH4wYyc8Wbo5FeA2RlOsSUiR2de2g2ZrlJIWrkTCIoD9z5mwIPgXTsWOn_xP9yhrbpIpP1u--k6-g_iIxV88BkcKOvgTr8BnDs68Si-sJs9_y1b_Mj8Aj1Y3xUYADSgOe1FscjwJhOWmfXWLgUtr_Gy8yu_hQu6RfP1IS57GE9s1lk96M-Juw30bbdjGmvLvdFCrnu95AsoQJKg5n2r61rOro_be2w',
    beds: 2,
    baths: 1,
    area: '110 م²',
    type: 'sale' as const
  }
];

@Component({
  selector: 'app-favorites',
  imports: [CommonModule, RouterLink, AgentSidebarComponent],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss'
})
export class FavoritesComponent {
  private globalState = inject(GlobalStateService);

  // سنقوم بجلب العقارات المفضلة من الـ Global State
  // ومقارنتها مع قائمة العقارات الكاملة (أو جلب تفاصيلها من الباك اند)
  // حالياً سنفترض وجود دالة لجلب التفاصيل

  favorites = computed(() => {
    const favoriteIds = this.globalState.favorites();
    // In a real app we would query backend for properties with these IDs
    // For now returning mock empty or we need a PropertyService that has 'getAll' which is robust
    // We will map the mock ALL_PROPERTIES to match IDs for now to show something
    return ALL_PROPERTIES.filter(p => favoriteIds.includes(p.id.toString())); 
  });

  favoritesCount = computed(() => this.favorites().length);

  removeFromFavorites(id: number | string) {
    this.globalState.toggleFavorite(id.toString());
  }
}
