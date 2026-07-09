const express = require('express');
const path = require('path');

const adminRoutes = require('./routes/adminRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const tableRoutes = require('./routes/tableRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const { errorHandler } = require('./middleware/errorHandler');
const { uploadRoot } = require('./services/uploadService');

function createApp() {
  const app = express();

  app.use(express.json({ limit: '8mb' }));

  app.get('/healthz', (req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/admin', adminRoutes);
  app.use('/api/menu', menuRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/restaurant', restaurantRoutes);
  app.use('/api/tables', tableRoutes);
  app.use('/api/uploads', uploadRoutes);
  app.use('/uploads', express.static(path.resolve(uploadRoot), {
    fallthrough: false,
    maxAge: '7d'
  }));

  app.use((req, res) => {
    res.status(404).json({ error: 'Không tìm thấy API.' });
  });

  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
