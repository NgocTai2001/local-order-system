const express = require('express');

const adminRoutes = require('./routes/adminRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const tableRoutes = require('./routes/tableRoutes');
const { errorHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  app.use(express.json({ limit: '256kb' }));

  app.get('/healthz', (req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/admin', adminRoutes);
  app.use('/api/menu', menuRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/tables', tableRoutes);

  app.use((req, res) => {
    res.status(404).json({ error: 'Không tìm thấy API.' });
  });

  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
