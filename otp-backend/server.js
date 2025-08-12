// Main server file
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import { testSupabaseConnection } from './utils/supabase.js';
import { testEmailConfig } from './utils/email.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://yourdomain.com'] // Add your production domains
        : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'OTP Registration API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API routes
app.use('/api/auth', authRoutes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    
    res.status(error.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : error.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    });
});

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    
    process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const startServer = async () => {
    try {
        console.log('🚀 Starting OTP Registration API...\n');
        
        // Test Supabase connection
        console.log('📊 Testing Supabase connection...');
        const supabaseConnected = await testSupabaseConnection();
        if (!supabaseConnected) {
            console.error('❌ Failed to connect to Supabase. Please check your configuration.');
            process.exit(1);
        }
        
        // Test email configuration
        console.log('📧 Testing email configuration...');
        const emailConfigValid = await testEmailConfig();
        if (!emailConfigValid) {
            console.warn('⚠️ Email configuration invalid. OTP emails will not be sent.');
        }
        
        // Start HTTP server
        app.listen(PORT, () => {
            console.log(`\n✅ Server running on port ${PORT}`);
            console.log(`🌐 Health check: http://localhost:${PORT}/health`);
            console.log(`📋 API endpoints:`);
            console.log(`   POST http://localhost:${PORT}/api/auth/check-email`);
            console.log(`   POST http://localhost:${PORT}/api/auth/send-otp`);
            console.log(`   POST http://localhost:${PORT}/api/auth/verify-otp`);
            console.log(`\n🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📝 Logs: Request logging enabled`);
            console.log(`\n🎉 OTP Registration API ready!\n`);
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();
