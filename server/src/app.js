require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
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

// Trust Render's reverse proxy for correct IP rate-limiting
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB();

// Security Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

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

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// HTTP request logger
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
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
        env: process.env.NODE_ENV,
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
    console.error('Error:', err.stack);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
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
