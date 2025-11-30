import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-property-details',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './property-details.component.html',
  styleUrl: './property-details.component.scss'
})
export class PropertyDetailsComponent {
  // UI States
  isDescriptionExpanded = signal(false);
  isAiModalOpen = signal(false);

  // Property Data (Mock)
  property = {
    id: 1,
    title: 'شقة مودرن بإطلالة على النيل',
    location: 'الزمالك، القاهرة',
    type: 'بيع',
    refCode: 'SKN-84521',
    price: 5250000, // Number for calculation
    area: 185,
    beds: 3,
    baths: 2,
    floor: 'السابع',
    description: `اكتشف حياة الرفاهية في هذه الشقة المذهلة كاملة التشطيب في قلب الزمالك، أحد أرقى أحياء القاهرة. تتميز بإطلالات بانورامية خلابة على نهر النيل من شرفتها الواسعة. تحتوي الشقة على مساحة معيشة وطعام مفتوحة وعصرية، وثلاث غرف نوم واسعة، بما في ذلك جناح رئيسي بحمام خاص، ومطبخ مجهز بأحدث الأجهزة.
    
    يوفر المبنى أمنًا على مدار 24 ساعة، وموقف سيارات مخصص، ويقع على بعد خطوات من أرقى المطاعم والمقاهي والمتاجر في الزمالك. بفضل موقعها المتميز وتشطيباتها عالية الجودة، تمثل هذه الشقة فرصة فريدة للمشترين المميزين الباحثين عن الراحة والأناقة.`,
    amenities: [
      { icon: 'local_parking', label: 'موقف خاص' },
      { icon: 'balcony', label: 'شرفة' },
      { icon: 'security', label: 'أمن 24/7' },
      { icon: 'elevator', label: 'مصعد' },
      { icon: 'pets', label: 'يسمح بالحيوانات' },
      { icon: 'air', label: 'تكييف مركزي' },
      { icon: 'view_stream', label: 'إطلالة نيلية' },
      { icon: 'kitchen', label: 'مطبخ مجهز' },
    ],
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCZkBphwjZw89dEosMQbYQAs7jOkyxjBj3J-kqlUPl86TinIO06PpPBEuruxHMXgI7LjiYGLKlO41NpZnhBvotI0Io0s21T87XsUeN35CujFke6rCbsX7-kJoz2UaCBAdajqSprucp-k04hcznx-birstdSoKv91uDwKJJWAM558C_hu6aKS59uNLKm0zf5k17hZMjDPq7TvnuMXeP8LftkDKk-dFsYMkgY0yTDeeADXP1MEIMmEH2JZxDLMie2NH8g6S0-iz2IPOg', // Main
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA6E4dQ4qrArF-4z_nX23psmNMv0Ucz5ApukGCItsYUyizcYt0l4GioM-zfpzfQjriR1Y9Bef6Y9Tn85qyDW2PGpjM_HugwXswZWhoMkCeG2fugrqHmabVhJ4xx2kxBZK_j5vK23glHiRUHP_of602JX4Gx6CPVbgAFDuQDEQRpmFp2yXbvv5fLLpKTZTNBSowMEErOtUGHXQ2UJ1jlvltnRR0plh5OOlcE2WZudUhWh7mAxDPW2VG4K9BTEdhTVNkJpnnvK_m1KMw',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD18HUGd6q4ve5NADgPYxZIzdkUGDz5bAFu34LGOqJ6n_Utal2-JXB7C2fqaHRkvzbv_6XtmeLGiLZeGkeZf7h1zhGOnN0dLirTF5qKuNO6vNCVXMzul5D-ZrDSQwDPxvRe0qaUWUBZTaTfVWlhY5Ro5J18LQ7smkebsygZVB0yU1AE8nIR73rBJwLdZJIjur-2NYwgmfnu2gYXbAVvyfnkKwRqFWCPlxN6Y3DGZsCqHTq81vkpXZHQf5ZW7oiwd5DQbT5Z4a0f8O8',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCfw84hXE7jfGa-TqHrxBKpoa0wwpRorFMSt6FykBbURHvMZQRZAhVZolX4Wvq37brLCaPMy7D6UrYpL6OHH33xvMm2K86AfBHdt2x0V2a44VJKW9q-nXJa2GxnSiZkKjmGFM1tfSp35A1KT40XBs0xGdIpa3a5WoBtP_VmpU-nEbNO0raxzysbuGrg3vwYcJUaghJ7QQLkzZlc0XRPL80ETuaz2eDULWiqDjWMxwf2hofZGwRXWz2spIcVPYbDCNHFlL_m_L9NRL0',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCCIHV8gGK9Vzf2iVyWNwmvTjfBayQKjkxH945Ueq9fRARKroQ0-On-GBTOFW2NPHuz3NLN6-pYpwgQmcBi45ofSMcFU4Z-A8anPJqiNRjo0epID445r0mlc36FJE3ag6uFiFFrK7gO-wdUogOmcFMoqjGmCLP6fDvxHEy2SnLLqzjSRs3B15pUeyMcgrZNm3DjoiHohpCBkj1FSxOixW9sDigkr-Dz6t_ZmaufArSaC245_psmBOw9znq-o-JvvsGT1Qi8MVOWI38',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCky7v5yFdd4m1E5KxAC73rF-mjImUEy7jy0abBVdka8_4XyDAYLEJ4HCl4Lt93LwTPLRQ9I_oltszyt8iZIsoEjyo4MmSWweb6WLU69SQxjBycTGEReFgI-zBsPLutyDJVNQLXQC0YmNCyHXk5PkO0n0KjMZIyO9KaqbV4b5f2g4EPgTUzlyaWcEudcPE40cV72ku5btWYPMGiHLtsnDtkYwVv039hfjvHf64RFbH21v-3-xE5rVk-c2aEfpsMl-wweUQVqg0VhIs'
    ]
  };

  // Agent Data
  agent = {
    id: 1,
    name: 'فاطمة السيد',
    title: 'استشاري عقاري أول',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAYlkJy_Q-BYpjYlJ_gL6iJtmowD-RgL-pXoVFg8cDDR5njt0x9GMJQxO5fVFIPx4ehXXWZDcow98vDmP78sT6Tk9F21Zok1wbNhnTZWj-mLoju521CLYe3ZRIbOocJS3lkXJ5b_qCojixmFA-nKiVFEDo1qwCONAYHnAgUi5hxUNa-lwCXmASmnAvweXcMmt3ijH-z2QWHJOaNE5znjTZ6ozHE1z96WTKijwdejxMIsgORy9Wj3siVQkM0sai0GJe5KLiPakkrMY',
    experience: '5+',
    deals: 82,
    rating: 4.9
  };

  // Similar Properties
  similarProperties = [
    {
      id: 2,
      title: 'دوبلكس واسع في المعادي',
      location: 'المعادي، القاهرة',
      price: 4900000,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_0e4lrNEtNRO0sLyVvsPdYEuQrDAGuYVS9RdtxZM3Y3QmR3lzl98ZpafsgBVQbLTahay1B5jbRDLKPl-qOm4GTg8Q2osYGmLoNNUu9NPo7DvBH7QAK0ymey8XiNbcgROeRL5o36AeKVq_Nh79ZfUxhR54WPbu1lJ_FItJe179CpNWyhOjz6YIef6g_dEd1ZCHJ8rfBXZUbR7Cl7BeaObLltyTABsGa3lRxE0WZTX1LE_-MDMuAxLnjX4qyPdZ7IaBw6spWIOukRw',
      beds: 4,
      baths: 3,
      area: 220
    },
    {
      id: 3,
      title: 'فيلا فاخرة في التجمع',
      location: 'القاهرة الجديدة',
      price: 5500000,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_0e4lrNEtNRO0sLyVvsPdYEuQrDAGuYVS9RdtxZM3Y3QmR3lzl98ZpafsgBVQbLTahay1B5jbRDLKPl-qOm4GTg8Q2osYGmLoNNUu9NPo7DvBH7QAK0ymey8XiNbcgROeRL5o36AeKVq_Nh79ZfUxhR54WPbu1lJ_FItJe179CpNWyhOjz6YIef6g_dEd1ZCHJ8rfBXZUbR7Cl7BeaObLltyTABsGa3lRxE0WZTX1LE_-MDMuAxLnjX4qyPdZ7IaBw6spWIOukRw',
      beds: 5,
      baths: 4,
      area: 300
    },
    {
      id: 4,
      title: 'بنتهاوس مع رووف',
      location: 'الشيخ زايد',
      price: 4750000,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_0e4lrNEtNRO0sLyVvsPdYEuQrDAGuYVS9RdtxZM3Y3QmR3lzl98ZpafsgBVQbLTahay1B5jbRDLKPl-qOm4GTg8Q2osYGmLoNNUu9NPo7DvBH7QAK0ymey8XiNbcgROeRL5o36AeKVq_Nh79ZfUxhR54WPbu1lJ_FItJe179CpNWyhOjz6YIef6g_dEd1ZCHJ8rfBXZUbR7Cl7BeaObLltyTABsGa3lRxE0WZTX1LE_-MDMuAxLnjX4qyPdZ7IaBw6spWIOukRw',
      beds: 3,
      baths: 3,
      area: 190
    }
  ];

  // --- Mortgage Calculator Logic ---
  mortgagePrice = signal(this.property.price);
  downPaymentPercent = signal(20);
  loanTerm = signal(15);
  interestRate = signal(8.5);

  monthlyPayment = computed(() => {
    const principal = this.mortgagePrice() * (1 - this.downPaymentPercent() / 100);
    const monthlyRate = this.interestRate() / 100 / 12;
    const numberOfPayments = this.loanTerm() * 12;
    
    if (monthlyRate === 0) return principal / numberOfPayments;

    const x = Math.pow(1 + monthlyRate, numberOfPayments);
    return (principal * x * monthlyRate) / (x - 1);
  });

  totalPaid = computed(() => {
    return (this.monthlyPayment() * this.loanTerm() * 12) + (this.mortgagePrice() * (this.downPaymentPercent() / 100));
  });

  // Actions
  toggleDescription() {
    this.isDescriptionExpanded.update(v => !v);
  }

  openAiModal() {
    this.isAiModalOpen.set(true);
  }

  closeAiModal() {
    this.isAiModalOpen.set(false);
  }
}