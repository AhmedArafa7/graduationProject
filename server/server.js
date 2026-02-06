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
