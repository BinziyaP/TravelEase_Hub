const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
require('dotenv').config();

// Debug: Check if environment variables are loaded
console.log('🔍 Debug - Environment variables:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Loaded' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Loaded' : '❌ Missing');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Loaded' : '❌ Missing');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const supabaseAuthRoutes = require('./routes/supabase-auth');
const geocodingRoutes = require('./routes/geocoding');
const attractionsRoutes = require('./routes/attractions');
const accurateSearchRoutes = require('./routes/search');
const googlePlacesRoutes = require('./routes/places-search');
const placesAutocompleteRoutes = require('./routes/places-autocomplete');
const itineraryGeneratorRoutes = require('./routes/itinerary-generator');
const restaurantsRoutes = require('./routes/restaurants');
const bookingRoutes = require('./routes/booking');
const socialRoutes = require('./routes/social');
const poolingRoutes = require('./routes/pooling');
const expensesRoutes = require('./routes/expenses');
const itineraryRoutes = require('./routes/itinerary');
const { initializeSupabase } = require('./config/supabase');
require('./config/passport'); // Initialize passport configuration

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:5175', 
  'http://192.168.56.1:5173',
  'http://192.168.0.142:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://192.168.')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Initialize Supabase
initializeSupabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', dashboardRoutes);
app.use('/api/supabase-auth', supabaseAuthRoutes);
app.use('/api', geocodingRoutes);
app.use('/api/attractions', attractionsRoutes);
app.use('/api/search', accurateSearchRoutes);
app.use('/api/search/google', googlePlacesRoutes);
app.use('/api/autocomplete/places', placesAutocompleteRoutes);
app.use('/api/search/restaurants', restaurantsRoutes);
app.use('/api/itinerary', itineraryGeneratorRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/pooling', poolingRoutes); // Added pooling route
app.use('/api/expenses', expensesRoutes); // Added expenses route
app.use('/api/group-itinerary', itineraryRoutes); // Changed from /api/itinerary to avoid conflict
app.use('/api/upload', require('./routes/upload'));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'TravelEase API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to TravelEase API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      geocoding: '/api/geocode',
      health: '/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server with Socket.io
const http = require('http');
const { Server } = require("socket.io");
const socketHandlers = require('./socket_handlers');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://192.168.')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Initialize Socket Handlers
socketHandlers(io);

// Store io instance in app for use in routes (e.g., for alerts)
app.set('io', io);

server.listen(PORT, () => {
  console.log(`🚀 TravelEase API (with Socket.io) running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

module.exports = app;
