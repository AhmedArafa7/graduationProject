const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// 1. إعداد التطبيق
const app = express();
app.use(cors());
app.use(bodyParser.json());

// 2. الاتصال بقاعدة البيانات (محلياً أو Atlas)
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://ahmed:TGZhPF75jhb0gZjS@cluster0.h1s04.mongodb.net/?appName=Cluster0'; 

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // تعطي خطأ فورياً إذا لم يكن هناك اتصال
    };

    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
      console.log('✅ Connected to MongoDB (Baytology DB)');
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Middleware لضمان الاتصال قبل كل طلب
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    return next();
  }
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
});

/* 
  ========================================================================================
  🚀 FUTURE PLAN: CLOUD STORAGE MIGRATION (LOCKED PLAN)
  ========================================================================================
  Currently, we are using "Client-side Compression" (ngx-image-compress) to keep image sizes 
  under 100KB and storing them as Base64 strings in MongoDB. This is optimal for MVP cost-saving.

  TRIGGER FOR CHANGE:
  When database size exceeds 4GB or response times slow down significantly.

  ACTION PLAN:
  1. Create account on Cloudinary or AWS S3.
  2. Update backend to accept files (using Multer).
  3. Upload file to Cloud -> Get URL -> Save URL in MongoDB (instead of Base64).
  4. Write a script to migrate existing Base64 strings to Cloud URLs.
  ========================================================================================
*/

// ==========================================
// 3. تعريف الـ SCHEMAS (من الملف المرفق)
// ==========================================
const Schema = mongoose.Schema;

// User Schema
const UserSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'] 
  },
  password: { type: String, required: true, minlength: [6, 'Password must be at least 6 characters.'] },
  phone: { 
    type: String, 
    required: true, 
    match: [/^01[0125][0-9]{8}$/, 'Please use a valid Egyptian phone number (01xxxxxxxxx).'] 
  },
  city: { type: String }, // For filtering agents by location
  address: { type: String },
  profileImage: { type: String },
  userType: { type: String, enum: ['buyer', 'agent', 'admin'], default: 'buyer' },
  agentProfile: {
    title: String, licenseNumber: String, company: String,
    experience: String, specialization: String, bio: String,
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    activeProperties: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    socialLinks: { facebook: String, linkedin: String, twitter: String }
  },
  isBanned: { type: Boolean, default: false },
  favorites: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Property Schema
const PropertySchema = new Schema({
  title: { type: String, required: true, index: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, index: true, min: [0, 'Price must be positive'] },
  currency: { type: String, default: 'EGP' },
  area: { type: Number, required: true, min: [0, 'Area must be positive'] },
  location: {
    city: { type: String, required: true, index: true },
    address: { type: String, required: true },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], index: '2dsphere' } 
    }
  },
  type: { type: String, enum: ['sale', 'rent'], required: true, index: true },
  propertyType: { type: String, enum: ['apartment', 'villa', 'house', 'land', 'commercial', 'chalet', 'duplex'], required: true },
  bedrooms: { type: Number, required: true },
  bathrooms: { type: Number, required: true },
  floor: { type: Number },
  images: [{ type: String }],
  coverImage: { type: String },
  features: [{ type: String }],
  status: { type: String, enum: ['available', 'sold', 'rented'], default: 'available' },
  isFeatured: { type: Boolean, default: false },
  aiAnalysis: { priceLabel: String, score: Number, confidence: Number },
  agent: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

// Blog Post Schema
const PostSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String },
  category: { type: String, required: true, index: true },
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  readTime: String,
  views: { type: Number, default: 0 },
  publishedAt: { type: Date, default: Date.now }
});

// Contact/Message Schema
const MessageSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  subject: String,
  message: { type: String, required: true },
  status: { type: String, enum: ['new', 'read', 'archived'], default: 'new' },
  createdAt: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model('User', UserSchema);
const Property = mongoose.model('Property', PropertySchema);
const Post = mongoose.model('Post', PostSchema);
const Message = mongoose.model('Message', MessageSchema);

// Review Schema
const ReviewSchema = new Schema({
  targetId: { type: String, required: true, index: true }, // agentId or propertyId
  targetType: { type: String, enum: ['agent', 'property'], required: true },
  author: { type: String, required: true }, // Could be ObjectId ref to User
  authorId: { type: Schema.Types.ObjectId, ref: 'User' },
  avatar: { type: String },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String },
  createdAt: { type: Date, default: Date.now }
});
const Review = mongoose.model('Review', ReviewSchema);

// Notification Schema
const NotificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['message', 'property', 'system', 'price'], default: 'system' },
  read: { type: Boolean, default: false },
  icon: { type: String },
  createdAt: { type: Date, default: Date.now }
});
const Notification = mongoose.model('Notification', NotificationSchema);

// Chat Schemas
const ChatMessageSchema = new Schema({
  conversationId: { type: String, required: true, index: true },
  senderId: { type: String, required: true }, // 'user' or Agent ID
  text: { type: String },
  attachment: {
    name: String,
    size: String,
    type: String,
    url: String
  },
  createdAt: { type: Date, default: Date.now }
});
const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);

const ConversationSchema = new Schema({
  participants: [{ type: String }], // [userId, agentId]
  participantsDetails: [{
    id: String,
    name: String,
    avatar: String,
    role: String
  }],
  lastMessage: String,
  unreadCount: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});
const Conversation = mongoose.model('Conversation', ConversationSchema);

// ==========================================
// 4. GENERIC CRUD ROUTES (مولد الروابط التلقائي)
// ==========================================
const createCrudRoutes = (model, routeName) => {
  const router = express.Router();

  // GET ALL (with optional filtering)
  router.get('/', async (req, res) => {
    try {
      const filter = req.query; // Accept query parameters for filtering
      const items = await model.find(filter).limit(100).sort({ createdAt: -1 });
      res.json(items);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // GET User Favorites (Specific to User Model)
  if (model.modelName === 'User') {
    router.get('/:id/favorites', async (req, res) => {
      try {
        const user = await model.findById(req.params.id).populate('favorites');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user.favorites);
      } catch (err) { res.status(500).json({ error: err.message }); }
    });

    // POST Toggle Favorite
    router.post('/:id/favorites', async (req, res) => {
      try {
        const { propertyId } = req.body;
        const user = await model.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const index = user.favorites.indexOf(propertyId);
        if (index === -1) {
          user.favorites.push(propertyId); // Add
        } else {
          user.favorites.splice(index, 1); // Remove
        }
        
        await user.save();
        res.json(user.favorites); // Return updated list of IDs
      } catch (err) { res.status(500).json({ error: err.message }); }
    });
  }

  // GET ONE
  router.get('/:id', async (req, res) => {
    try {
      const item = await model.findById(req.params.id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      res.json(item);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // POST (Create)
  router.post('/', async (req, res) => {
    try {
      const newItem = new model(req.body);
      const savedItem = await newItem.save();
      res.status(201).json(savedItem);
    } catch (err) { res.status(400).json({ error: err.message }); }
  });

  // PUT (Update)
  router.put('/:id', async (req, res) => {
    try {
      const updatedItem = await model.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updatedItem);
    } catch (err) { res.status(400).json({ error: err.message }); }
  });

  // DELETE
  router.delete('/:id', async (req, res) => {
    try {
      await model.findByIdAndDelete(req.params.id);
      res.json({ message: 'Deleted successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  return router;
};

// تفعيل الروابط
app.use('/api/users', createCrudRoutes(User));
// FAQ Schema
const FaqSchema = new Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String, default: 'General' },
  createdAt: { type: Date, default: Date.now }
});
const Faq = mongoose.model('Faq', FaqSchema);

// ==========================================
// 4. GENERIC CRUD ROUTES (مولد الروابط التلقائي)
// ==========================================
// ... (code omitted for brevity if not modifying createCrudRoutes) ...
// Instead of modifying createCrudRoutes again, I will just append the route where others are defined.
// Wait, I need to insert the schema before models are compiled if I want to be clean, but putting it before routes is fine.

app.use('/api/users', createCrudRoutes(User));
app.use('/api/properties', createCrudRoutes(Property));
app.use('/api/posts', createCrudRoutes(Post));
app.use('/api/messages', createCrudRoutes(Message));
app.use('/api/reviews', createCrudRoutes(Review));
app.use('/api/notifications', createCrudRoutes(Notification));
app.use('/api/faqs', createCrudRoutes(Faq));

// Chat Routes
const chatRouter = express.Router();

// Get User Conversations
chatRouter.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    
    // Find conversations where participants array contains userId
    const conversations = await Conversation.find({ participants: userId }).sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get Messages for Conversation
chatRouter.get('/:id/messages', async (req, res) => {
  try {
    const messages = await ChatMessage.find({ conversationId: req.params.id }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Send Message
chatRouter.post('/:id/messages', async (req, res) => {
  try {
    const { text, senderId, attachment } = req.body;
    const conversationId = req.params.id;
    
    // Create Message
    const newMessage = new ChatMessage({ conversationId, senderId, text, attachment });
    await newMessage.save();
    
    // Update Conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text || (attachment ? 'مرفق' : ''),
      updatedAt: Date.now(),
      $inc: { unreadCount: 1 } // Primitive unread logic
    });
    
    res.status(201).json(newMessage);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Start New Conversation
chatRouter.post('/', async (req, res) => {
  try {
    const { participants, participantsDetails, firstMessage } = req.body;
    // Check existing
    // Logic simplified: just create new for now or finding existing based on participants could be added
    
    const newConv = new Conversation({ participants, participantsDetails, lastMessage: firstMessage || '' });
    await newConv.save();
    res.status(201).json(newConv);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.use('/api/chat', chatRouter);

const aiRouter = express.Router();

aiRouter.post('/chat', async (req, res) => {
  try {
    const { message, session_id } = req.body;
    
    // 1. Simple Keyword Extraction (Rule-Based AI)
    const query = {};
    const filters = {};
    const keywords = message.toLowerCase();

    // Type Extraction
    if (keywords.includes('apartment') || keywords.includes('flat') || keywords.includes('شقة')) filters.type = 'apartment';
    if (keywords.includes('villa') || keywords.includes('فيلا')) filters.type = 'villa';
    
    // Purpose Extraction
    if (keywords.includes('rent') || keywords.includes('إيجار')) query.type = 'rent';
    if (keywords.includes('sale') || keywords.includes('buy') || keywords.includes('بيع') || keywords.includes('شراء')) query.type = 'sale';

    // Location Extraction (Simple)
    const locations = ['cairo', 'giza', 'new cairo', 'maadi', 'zamalek', 'nasr city', '6th of october', 'sheikh zayed'];
    // Arabic Mapping could be added here
    locations.forEach(loc => {
      if (keywords.includes(loc)) query['location.city'] = { $regex: loc, $options: 'i' };
    });

    // Price Extraction (Very basic: finds numbers)
    const numbers = message.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      // Assume the largest number is price if > 1000
      const potentialPrice = numbers.map(n => parseInt(n)).filter(n => n > 1000);
      if (potentialPrice.length > 0) {
        filters.priceTo = Math.max(...potentialPrice);
        query.price = { $lte: filters.priceTo };
      }
    }

    // 2. Database Search
    // Combine filters if property schema uses them differently. 
    // Schema: type (sale/rent), price, location.city. 
    // Property Type is inside 'features' maybe? Or missing in schema? 
    // Retaining 'type' as sale/rent based on schema seen earlier. 
    // We'll search primarily by Price, Location, Type(Sale/Rent).
    
    const properties = await Property.find(query).limit(5);

    // 3. Construct Response
    let reply = '';
    if (properties.length > 0) {
      reply = `وجدنا ${properties.length} عقارات تطابق بحثك.`;
    } else {
      reply = 'عذراً، لم نجد عقارات تطابق طلبك بدقة، لكن يمكنك تجربة البحث في صفحة العقارات.';
    }

    // 4. Log interaction
    const newLog = new AiLog({
      question: message,
      answer: reply,
      context: properties.map(p => p._id),
      provider: 'local' // Rule-based
    });
    await newLog.save();

    res.json({
      message: reply,
      filters: filters,
      properties: properties
    });

  } catch (err) {
    console.error('AI Error:', err);
    res.status(500).json({ error: 'AI processing failed' });
  }
});

app.use('/api/ai', aiRouter);

// AI Log Schema (New Feature)
const AiLogSchema = new Schema({
  question: { type: String }, // User's question
  context: [{ type: String }], // Property IDs compared
  answer: { type: String, required: true },
  provider: { type: String, enum: ['local', 'external'], default: 'local' },
  needsReview: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const AiLog = mongoose.model('AiLog', AiLogSchema);
app.use('/api/ai/log', createCrudRoutes(AiLog));

// Content Schema (Dynamic Site Content)
const ContentSchema = new Schema({
  type: { type: String, enum: ['value', 'stat', 'team', 'partner'], required: true },
  title: { type: String }, // For values/stats/team
  subtitle: { type: String }, // For roles/descriptions
  description: { type: String },
  icon: { type: String }, // material icon name
  image: { type: String }, // URL
  order: { type: Number, default: 0 },
  isVisible: { type: Boolean, default: true }
});
const Content = mongoose.model('Content', ContentSchema);
app.use('/api/content', createCrudRoutes(Content));

// Testimonial Schema
const TestimonialSchema = new Schema({
  name: { type: String, required: true },
  role: { type: String }, // e.g. "Buyer", "Seller"
  text: { type: String, required: true },
  rating: { type: Number, default: 5 },
  image: { type: String },
  date: { type: Date, default: Date.now }
});
const Testimonial = mongoose.model('Testimonial', TestimonialSchema);
app.use('/api/testimonials', createCrudRoutes(Testimonial));

// Blog Schema
const BlogPostSchema = new Schema({
  title: { type: String, required: true },
  excerpt: { type: String, required: true },
  content: { type: String },
  image: { type: String },
  author: { type: String },
  authorImage: { type: String },
  authorTitle: { type: String },
  category: { type: String },
  views: { type: String, default: '0' },
  readTime: { type: String },
  date: { type: Date, default: Date.now }
});
const BlogPost = mongoose.model('BlogPost', BlogPostSchema);
app.use('/api/posts', createCrudRoutes(BlogPost));

// Seed Default Content if Empty
const seedContent = async () => {
  try {
    const count = await Content.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding default content...');
      const defaultContent = [
        // Values
        { type: 'value', title: 'محامي المشتري', icon: 'shield_person', description: 'نحن لا نبيع العقارات، نحن نساعدك تشتريها. ولائنا لك وحدك، وليس للبائع أو المطور العقاري.', order: 1 },
        { type: 'value', title: 'الحقيقة العارية', icon: 'visibility', description: 'نخبرك عن عيوب المنطقة ومشاكل العقار قبل أن نحدثك عن مميزاته. الشفافية ليست خياراً، بل مبدأ.', order: 2 },
        { type: 'value', title: 'الأرقام لا تكذب', icon: 'analytics', description: 'نلغي العواطف من المعادلة. نستخدم 50 مليون نقطة بيانات لتقييم العقار بسعره العادل الحقيقي.', order: 3 },
        
        // Stats
        { type: 'stat', title: '+50M', subtitle: 'نقطة بيانات محللة', order: 1 },
        { type: 'stat', title: '0%', subtitle: 'عمليات خداع', order: 2 },
        { type: 'stat', title: '+12K', subtitle: 'ساعة بحث تم توفيرها', order: 3 },

        // Team (Sample)
        { type: 'team', title: 'أحمد عرفه', subtitle: 'Frontend Engineer', image: './Ahmed_Arafa.jpg', order: 1 },
      ];
      await Content.insertMany(defaultContent);
      console.log('✅ Default content seeded successfully');
    }

    // Seed Testimonials
    const testimonialCount = await Testimonial.countDocuments();
    if (testimonialCount === 0) {
      console.log('🌱 Seeding default testimonials...');
      await Testimonial.insertMany([
        {
          name: 'حسن مصطفى',
          role: 'مشتري',
          date: new Date('2023-08-15'),
          rating: 5,
          text: "تجربة البحث بالذكاء الاصطناعي كانت مذهلة! وصفت الشقة التي أحلم بها ووجد لي النظام خيارات ممتازة في ثوانٍ.",
          image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop'
        },
        {
          name: 'سلمى أحمد',
          role: 'مستأجر',
          date: new Date('2023-07-22'),
          rating: 4.5,
          text: "الوكيل الذي تواصلت معه كان محترفاً جداً ويعرف منطقة التجمع جيداً. شكراً Baytology.",
          image: '/hijab_salma.png'
        },
        {
          name: 'عمر خالد',
          role: 'مستثمر',
          date: new Date('2023-06-05'),
          rating: 5,
          text: "كنت قلقاً كوني مشتري لأول مرة، لكن الموقع سهل عليّ كل الخطوات من البحث وحتى التعاقد.",
          image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop'
        }
      ]);
      console.log('✅ Default testimonials seeded successfully');
    }

    // Seed Blog Posts
    const postCount = await BlogPost.countDocuments();
    if (postCount === 0) {
      console.log('🌱 Seeding default blog posts...');
      await BlogPost.insertMany([
        {
          title: 'كيف تختار عقارك الأول؟ نصائح للمبتدئين',
          excerpt: 'شراء العقار الأول هو خطوة كبيرة. إليك أهم النصائح التي يجب عليك معرفتها قبل اتخاذ القرار لضمان استثمار ناجح.',
          image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          author: 'كريم محمد',
          authorImage: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
          authorTitle: 'مستشار عقاري',
          date: new Date('2023-10-15'),
          readTime: '5 دقائق',
          category: 'نصائح للبائعين',
          views: '1.2k'
        },
        {
          title: 'تحليل سوق العقارات في التجمع الخامس 2024',
          excerpt: 'نظرة شاملة على تطور أسعار المتر في التجمع الخامس وأهم المناطق الواعدة للاستثمار في الفترة القادمة.',
          image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          author: 'منى السيد',
          authorImage: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
          authorTitle: 'محلل اقتصادي',
          date: new Date('2023-10-10'),
          readTime: '7 دقائق',
          category: 'أخبار السوق',
          views: '850'
        },
        {
          title: 'أحدث صيحات التصميم الداخلي للشقق الصغيرة',
          excerpt: 'استغل كل شبر في شقتك مع هذه الأفكار الذكية للتصميم والديكور التي تجعل المساحات الصغيرة تبدو أكبر.',
          image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          author: 'ليلى حسن',
          authorImage: 'https://i.pravatar.cc/150?u=a04258114e29026302d',
          authorTitle: 'مهندسة ديكور',
          date: new Date('2023-10-05'),
          readTime: '4 دقائق',
          category: 'تصميم وديكور',
          views: '2.1k'
        }
      ]);
      console.log('✅ Default blog posts seeded successfully');
    }
  } catch (err) {
    console.error('❌ Error seeding content:', err);
  }
};
// Run seed on connection
// Run seed on connection (Using existing connection to prevent pool exhaustion)
if (mongoose.connection.readyState === 1) {
  seedContent();
} else {
  mongoose.connection.once('connected', seedContent);
}

// Report Schema (Moderation)
const ReportSchema = new Schema({
  reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});
const Report = mongoose.model('Report', ReportSchema);
app.use('/api/reports', createCrudRoutes(Report));

// Custom Moderation Routes
const router = express.Router();

// Admin: Get all reports with details
router.get('/admin/reports', async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporter', 'firstName lastName email')
      .populate('property', 'title _id')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: Delete Property & Resolve Report
router.delete('/admin/property/:id', async (req, res) => {
  try {
    await Property.findByIdAndDelete(req.params.id);
    // Auto-resolve related reports
    await Report.updateMany({ property: req.params.id }, { status: 'resolved' });
    res.json({ message: 'Property deleted and reports resolved' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: Ban User
router.post('/admin/ban/:id', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isBanned: true });
    res.json({ message: 'User banned successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.use('/api', router);

// Authentication Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password }); // In prod: bcrypt.compare(password, user.password)
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (user.isBanned) {
      return res.status(403).json({ error: 'This account has been banned due to policy violations.' });
    }
    // Return user info (excluding password)
    const { password: _, ...userData } = user.toObject();
    res.json(userData);
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    const newUser = new User(req.body);
    const savedUser = await newUser.save(); // This will fail if DB is not connected
    const { password: _, ...userData } = savedUser.toObject();
    res.status(201).json(userData);
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ 
      error: 'Registration failed', 
      details: err.message,
      code: err.code 
    });
  }
});

// صفحة رئيسية للتأكد من العمل
app.get('/', (req, res) => {
  res.send('<h1>🚀 Baytology API is Running!</h1><p>Endpoints: /api/users, /api/properties, ...</p>');
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

module.exports = app;
