require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const scheduleAlertJob = require('./utils/alertJob');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const salesRoutes = require('./routes/sales');
const alertsRoutes = require('./routes/alerts');
const dashboardRoutes = require('./routes/dashboard');
const aiRoutes = require('./routes/ai');

const app = express();
app.use(cors());
app.use(express.json());

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
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;

async function start() {
  await sequelize.sync(); // creates tables if they don't exist
  scheduleAlertJob();
  app.listen(PORT, () => console.log(`Retail backend running on http://localhost:${PORT}`));
}

start();
