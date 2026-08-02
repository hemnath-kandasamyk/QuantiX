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
if (isProd && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dev-secret-change-in-production')) {
  console.error('FATAL: JWT_SECRET must be set to a real random string in production.');
  process.exit(1);
}

// Comma-separated list, e.g. FRONTEND_URL=https://quantix.vercel.app,https://www.quantix.app
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const app = express();
app.set('trust proxy', 1); // needed behind Render/Railway/Heroku-style reverse proxies
app.use(helmet());
app.use(morgan(isProd ? 'combined' : 'dev'));
app.use(
  cors({
    origin: isProd ? allowedOrigins : true,
    credentials: true,
  })
);
app.use(express.json());

// Brute-force protection on auth endpoints specifically, not the whole API.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again in a few minutes.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register-shop', authLimiter);

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: isProd ? 'Internal server error' : err.message });
});

const PORT = process.env.PORT || 4000;

async function start() {
  if (isProd) {
    // In production, the schema comes from `npm run db:migrate` (run once
    // during deploy), not from sync() — sync() can silently alter/drop
    // columns and is unsafe once you have real data.
    await sequelize.authenticate();
  } else {
    await sequelize.sync(); // convenient auto-schema for local dev/demo only
  }
  scheduleAlertJob();
  app.listen(PORT, () => console.log(`Retail backend running on http://localhost:${PORT}`));
}

if (require.main === module) {
  start().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

module.exports = app;
