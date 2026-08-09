require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { sequelize } = require('./models');
const scheduleAlertJob = require('./utils/alertJob');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const salesRoutes = require('./routes/sales');
const alertsRoutes = require('./routes/alerts');
const dashboardRoutes = require('./routes/dashboard');
const aiRoutes = require('./routes/ai');

const isProd = process.env.NODE_ENV === 'production';

// Fail fast rather than silently signing tokens with a guessable default.
if (
    isProd &&
    (!process.env.JWT_SECRET ||
        process.env.JWT_SECRET === 'dev-secret-change-in-production')
) {
    console.error(
        'FATAL: JWT_SECRET must be set to a real random string in production.'
    );
    process.exit(1);
}

// Allowed frontend origins
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://quanti-x.vercel.app',
    'https://quanti-x-git-main-quanti-x1.vercel.app'
];

const app = express();

app.set('trust proxy', 1);

app.use(helmet());

app.use(morgan(isProd ? 'combined' : 'dev'));

app.use(
    cors({
        origin: isProd ? allowedOrigins : true,
        credentials: true,
    })
);

app.use(express.json());

// Brute-force protection on auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many attempts. Please try again in a few minutes.'
    },
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register-shop', authLimiter);

// Health check
app.get('/api/health', async (req, res) => {
    try {
        await sequelize.authenticate();

        res.status(200).json({
            status: 'healthy',
            database: 'connected',
            environment: process.env.NODE_ENV,
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            database: 'disconnected',
            error: error.message,
        });
    }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);

// 404
app.use((req, res) =>
    res.status(404).json({
        error: 'Route not found',
        success: false
    })
);

// Error handler
app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        error: isProd ? 'Internal server error' : err.message
    });
});

const PORT = process.env.PORT || 4000;

async function start() {
    try {
        if (isProd) {
            // Production: verify database connection.
            await sequelize.authenticate();
            console.log('Database connection established.');
        } else {
            // Local development/demo.
            await sequelize.sync();
        }

        scheduleAlertJob();

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Retail backend running on port ${PORT}`);
        });

    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

if (require.main === module) {
    start();
}

module.exports = app;
