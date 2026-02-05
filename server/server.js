const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// 1. إعداد التطبيق
const app = express();
app.use(cors());
app.use(bodyParser.json());

// 2. الاتصال بقاعدة البيانات (محلياً أو Atlas)
// غير الرابط إذا كنت تستخدم MongoDB Atlas
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://ahmed:TGZhPF75jhb0gZjS@cluster0.h1s04.mongodb.net/?appName=Cluster0'; 

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB (Baytology DB)'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// ==========================================
// 3. تعريف الـ SCHEMAS (من الملف المرفق)
// ==========================================
const Schema = mongoose.Schema;

// User Schema
const UserSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
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
  favorites: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Property Schema
const PropertySchema = new Schema({
  title: { type: String, required: true, index: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, index: true },
  currency: { type: String, default: 'EGP' },
  area: { type: Number, required: true },
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

// Authentication Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password }); // In prod: bcrypt.compare(password, user.password)
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // Return user info (excluding password)
    const { password: _, ...userData } = user.toObject();
    res.json(userData);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    const savedUser = await newUser.save();
    const { password: _, ...userData } = savedUser.toObject();
    res.status(201).json(userData);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
