require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const passport = require('passport');

const connectDB = require('./config/db');
const { startJobFetchCron } = require('./jobs/fetchJobs');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const resumeRoutes = require('./routes/resume');
const jobRoutes = require('./routes/jobs');
const aiRoutes = require('./routes/ai');
const adminRoutes = require('./routes/admin');
const studyRoutes = require('./routes/study');
const toolRoutes = require('./routes/tools');

// Passport config
require('./config/passport');

const app = express();

// Disable X-Powered-By header
app.disable('x-powered-by');

// Trust Render's reverse proxy for correct IP rate-limiting
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB();

// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
            connectSrc: ["'self'", "https://api.razorpay.com", "https://res.cloudinary.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'self'", "https://api.razorpay.com"],
        },
    },
}));

// Prevent NoSQL injection
app.use(mongoSanitize());

// Prevent XSS attacks
app.use(xss());

const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:3000',
    'http://localhost:5173',
    'https://jobvault-frontend.vercel.app',
    'https://jobvault.vercel.app'
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
        }
        return callback(null, true);
    },
    credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

// Auth rate limiter (stricter)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many auth attempts, please try again in 15 minutes.',
});
app.use('/api/auth', authLimiter);
app.use('/api/employer/login', authLimiter);
app.use('/api/employer/register', authLimiter);

// AI rate limiter (expensive operations)
const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 15, // 15 AI requests per hour
    message: 'AI request limit reached. Please try again in an hour.',
    standardHeaders: true,
});
app.use('/api/ai', aiLimiter);

// OTP rate limiter (very strict — prevents brute-force on 6-digit codes)
const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many OTP attempts. Please wait 15 minutes before trying again.',
});
app.use('/api/auth/verify-email', otpLimiter);
app.use('/api/auth/resend-otp', otpLimiter);
app.use('/api/employer/verify-otp', otpLimiter);
app.use('/api/employer/resend-otp', otpLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// HTTP request logger
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Passport
app.use(passport.initialize());

// Root route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to the JobVault API',
        version: '1.0.0'
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date(),
        uptime: process.uptime(),
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/payment', require('./routes/payment'));
app.use('/api/employer', require('./routes/employer'));

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
    if (process.env.NODE_ENV !== 'production') {
        console.error('Error:', err.stack);
    } else {
        console.error('Error:', err.message);
    }
    const statusCode = err.statusCode || 500;
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(statusCode).json({
        success: false,
        // Never leak internal error messages to clients in production
        message: isProduction && statusCode === 500
            ? 'An internal server error occurred. Please try again.'
            : (err.message || 'Internal Server Error'),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

// Start cron jobs
if (process.env.NODE_ENV !== 'test') {
    startJobFetchCron();
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 JobVault Server running on port ${PORT}`);
    console.log(`   ENV: ${process.env.NODE_ENV}`);
    console.log(`   URL: http://localhost:${PORT}`);
});

module.exports = app;
