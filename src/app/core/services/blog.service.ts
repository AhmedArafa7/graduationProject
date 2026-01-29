import { Injectable, signal } from '@angular/core';

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content?: string; // HTML content
  image: string;
  author: string;
  authorImage: string;
  authorTitle: string;
  date: string;
  readTime: string;
  category: string;
  views: string;
}

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  
  // قاعدة بيانات المقالات
  private posts: BlogPost[] = [
    {
      id: 1,
      title: 'مستقبل المنازل الذكية في مصر: الاتجاهات والتوقعات',
      excerpt: 'نظرة على مستقبل أسعار العقارات والفرص الاستثمارية في جميع أنحاء البلاد مع تحليل للخبراء.',
      content: `
        <p class="lead font-bold mb-4">تشهد مصر تحولًا رقميًا سريعًا، ومع هذا التحول، يزداد الاهتمام بمفهوم المنازل الذكية. لم تعد فكرة المنزل الذي يتحكم في إضاءته وتكييفه وأجهزته بكبسة زر أو أمر صوتي مجرد خيال علمي.</p>
        <h3 class="text-xl font-bold mt-6 mb-3">ما هي المنازل الذكية؟</h3>
        <p class="mb-4">المنزل الذكي هو منزل مجهز بتقنيات تسمح بالتحكم الآلي في الأنظمة المنزلية المختلفة مثل الإضاءة، والتدفئة، والتهوية، وتكييف الهواء، والأمن.</p>
        <blockquote class="border-r-4 border-primary pr-4 italic my-6 bg-gray-50 dark:bg-gray-800 p-4 rounded">"المنازل الذكية لم تعد ترفًا، بل استثمارًا في الراحة والأمان وكفاءة استهلاك الطاقة."</blockquote>
        <h3 class="text-xl font-bold mt-6 mb-3">الاتجاهات الحالية</h3>
        <ul class="list-disc list-inside space-y-2 mb-6">
          <li>زيادة الوعي والطلب على أنظمة الأمان.</li>
          <li>التحكم الصوتي عبر المساعدات الذكية.</li>
          <li>ترشيد استهلاك الطاقة.</li>
        </ul>
      `,
      category: 'تكنولوجيا العقارات',
      date: '2 أغسطس 2024',
      readTime: '8 دقائق',
      author: 'عمر المصري',
      authorTitle: 'خبير عقاري',
      authorImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2000&auto=format&fit=crop',
      views: '1.2k'
    },
    {
      id: 2,
      title: '5 نصائح ذهبية لتجهيز منزلك لبيع سريع وبأعلى سعر',
      excerpt: 'تعلم كيف تجعل عقارك لا يقاوم للمشترين المحتملين من خلال نصائح التجهيز البسيطة وغير المكلفة.',
      content: `
        <p class="lead font-bold mb-4">بيع المنزل ليس مجرد عرضه في السوق وانتظار المشترين. هناك فن وعلم وراء تجهيز العقار ليجذب أكبر عدد من المهتمين ويحقق أعلى سعر ممكن.</p>
        
        <h3 class="text-xl font-bold mt-6 mb-3">1. الانطباع الأول يدوم</h3>
        <p class="mb-4">واجهة المنزل هي أول ما يراه المشتري. تأكد من طلاء الباب الخارجي، تنظيف الحديقة الأمامية، وإضافة بعض النباتات الخضراء. هذه التفاصيل الصغيرة تخلق انطباعاً إيجابياً قوياً.</p>
        
        <h3 class="text-xl font-bold mt-6 mb-3">2. التخلص من الفوضى</h3>
        <p class="mb-4">المشترون يريدون تخيل أنفسهم في المنزل. تخلص من الأثاث الزائد والأغراض الشخصية. غرفة فارغة نسبياً تبدو أكبر وأكثر جاذبية.</p>
        
        <blockquote class="border-r-4 border-primary pr-4 italic my-6 bg-gray-50 dark:bg-gray-800 p-4 rounded">"المنزل المرتب والنظيف يمكن أن يرفع قيمة العقار بنسبة 10-15% مقارنة بنفس العقار في حالة فوضوية."</blockquote>
        
        <h3 class="text-xl font-bold mt-6 mb-3">3. الإضاءة الطبيعية</h3>
        <p class="mb-4">افتح الستائر، نظف النوافذ، وتأكد من دخول أكبر قدر من الضوء الطبيعي. الإضاءة الجيدة تجعل المساحات تبدو أكبر وأكثر دفئاً.</p>
        
        <h3 class="text-xl font-bold mt-6 mb-3">4. إصلاحات بسيطة بتأثير كبير</h3>
        <ul class="list-disc list-inside space-y-2 mb-6">
          <li>إصلاح الصنابير المتسربة</li>
          <li>تغيير مقابض الأبواب القديمة</li>
          <li>طلاء الجدران بألوان محايدة</li>
          <li>إصلاح الشقوق الصغيرة</li>
        </ul>
        
        <h3 class="text-xl font-bold mt-6 mb-3">5. الروائح الطيبة</h3>
        <p class="mb-4">تجنب الروائح القوية كالطبخ أو الحيوانات الأليفة. استخدم معطرات خفيفة أو أزهار طبيعية لخلق جو منعش ومريح.</p>
      `,
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2000&auto=format&fit=crop',
      author: 'فاطمة السيد',
      authorTitle: 'مهندسة ديكور',
      authorImage: '/hijab_fatima.png',
      views: '980',
      date: '10 أغسطس 2023',
      readTime: '4 دقائق',
      category: 'نصائح للبائعين'
    },
    {
      id: 3,
      title: 'الساحل الشمالي: وجهة الصيف والاستثمار الأولى',
      excerpt: 'اكتشف أفضل الكمبوندات وأماكن نمط الحياة في الساحل الشمالي لمنزل عطلتك القادم.',
      content: `
        <p class="lead font-bold mb-4">الساحل الشمالي المصري تحول من وجهة صيفية بسيطة إلى أحد أهم مراكز الاستثمار العقاري في الشرق الأوسط. إليك كل ما تحتاج معرفته قبل الشراء.</p>
        
        <h3 class="text-xl font-bold mt-6 mb-3">لماذا الساحل الشمالي؟</h3>
        <p class="mb-4">يمتد الساحل الشمالي على أكثر من 500 كيلومتر من الشواطئ الرملية البيضاء والمياه الفيروزية. المنطقة شهدت طفرة عمرانية هائلة في السنوات الأخيرة مع مشاريع عالمية المستوى.</p>
        
        <h3 class="text-xl font-bold mt-6 mb-3">أفضل المناطق للاستثمار</h3>
        <ul class="list-disc list-inside space-y-2 mb-6">
          <li><strong>العلمين الجديدة:</strong> المدينة المستقبلية بمشاريع حكومية ضخمة</li>
          <li><strong>سيدي عبد الرحمن:</strong> قلب الساحل النابض بالحياة</li>
          <li><strong>رأس الحكمة:</strong> الهدوء والخصوصية مع شواطئ خلابة</li>
          <li><strong>مراسي:</strong> الرفاهية والخدمات المتكاملة</li>
        </ul>
        
        <blockquote class="border-r-4 border-primary pr-4 italic my-6 bg-gray-50 dark:bg-gray-800 p-4 rounded">"أسعار العقارات في الساحل الشمالي حققت نمواً بنسبة 25-40% سنوياً خلال السنوات الخمس الماضية."</blockquote>
        
        <h3 class="text-xl font-bold mt-6 mb-3">نصائح قبل الشراء</h3>
        <p class="mb-4">تأكد من سمعة المطور العقاري، موقع المشروع بالتحديد، والخدمات المتاحة على مدار العام وليس فقط في الصيف. أيضاً، تحقق من خطط السداد والتسليم.</p>
        
        <h3 class="text-xl font-bold mt-6 mb-3">العائد الاستثماري</h3>
        <p class="mb-4">يمكن تأجير الوحدات في موسم الصيف بعوائد ممتازة تصل إلى 8-12% سنوياً، مما يجعلها استثماراً جذاباً للباحثين عن دخل إضافي.</p>
      `,
      image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2000&auto=format&fit=crop',
      author: 'ليلى حسن',
      authorTitle: 'محلل سوق',
      authorImage: '/hijab_hend.png',
      views: '2.5k',
      date: '05 أغسطس 2023',
      readTime: '7 دقائق',
      category: 'دليل المناطق'
    },
    {
      id: 4,
      title: 'كيف تختار الرهن العقاري المناسب لميزانيتك؟',
      excerpt: 'دليل شامل للمبتدئين حول أنواع التمويل العقاري المتاحة في مصر وكيفية التقديم.',
      content: `
        <p class="lead font-bold mb-4">شراء منزل هو أكبر قرار مالي يتخذه معظم الناس. فهم خيارات التمويل العقاري المتاحة يمكن أن يوفر لك آلاف الجنيهات ويجعل حلم امتلاك منزل حقيقة.</p>
        
        <h3 class="text-xl font-bold mt-6 mb-3">ما هو التمويل العقاري؟</h3>
        <p class="mb-4">التمويل العقاري هو قرض طويل الأجل مضمون بالعقار نفسه. يتيح لك شراء منزل بدفع جزء من قيمته مقدماً (المقدم) وتسديد الباقي على أقساط شهرية لسنوات.</p>
        
        <h3 class="text-xl font-bold mt-6 mb-3">أنواع التمويل العقاري في مصر</h3>
        <ul class="list-disc list-inside space-y-2 mb-6">
          <li><strong>مبادرة البنك المركزي:</strong> فائدة 3% لمحدودي ومتوسطي الدخل</li>
          <li><strong>التمويل البنكي التقليدي:</strong> فائدة تنافسية حسب البنك</li>
          <li><strong>التمويل الإسلامي:</strong> المرابحة والإجارة المنتهية بالتمليك</li>
          <li><strong>تمويل شركات التطوير:</strong> خطط سداد مباشرة مع المطور</li>
        </ul>
        
        <blockquote class="border-r-4 border-primary pr-4 italic my-6 bg-gray-50 dark:bg-gray-800 p-4 rounded">"القاعدة الذهبية: لا يجب أن يتجاوز القسط الشهري 35-40% من إجمالي دخلك الشهري."</blockquote>
        
        <h3 class="text-xl font-bold mt-6 mb-3">المستندات المطلوبة</h3>
        <ul class="list-disc list-inside space-y-2 mb-6">
          <li>بطاقة الرقم القومي سارية</li>
          <li>إثبات الدخل (كشف حساب بنكي أو شهادة راتب)</li>
          <li>عقد العقار أو وعد بالبيع</li>
          <li>صورة من رخصة البناء</li>
        </ul>
        
        <h3 class="text-xl font-bold mt-6 mb-3">نصائح للحصول على أفضل عرض</h3>
        <p class="mb-4">قارن بين عروض 3-4 بنوك على الأقل. انتبه للتكاليف الخفية مثل رسوم التقييم والتأمين. كلما زاد المقدم، قلت الفائدة الإجمالية التي ستدفعها.</p>
      `,
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2000&auto=format&fit=crop',
      author: 'محمود جمال',
      authorTitle: 'مستشار مالي',
      authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
      views: '1.8k',
      date: '01 أغسطس 2023',
      readTime: '6 دقائق',
      category: 'استثمار عقاري'
    }
  ];

  // تصنيفات المدونة
  private categories = [
    { name: 'نصائح للبائعين', count: 12 },
    { name: 'أخبار السوق', count: 8 },
    { name: 'تصميم وديكور', count: 5 },
    { name: 'تكنولوجيا العقارات', count: 3 }
  ];

  getCategories() {
    return this.categories;
  }
  
  getAllPosts() {
    return this.posts;
  }

  getPostById(id: number) {
    return this.posts.find(p => p.id === id);
  }

  getRelatedPosts(currentId: number) {
    return this.posts.filter(p => p.id !== currentId).slice(0, 3);
  }
}