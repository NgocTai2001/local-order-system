const express = require('express');

const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const { errorHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  app.use(express.json({ limit: '256kb' }));

  app.get('/healthz', (req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/menu', menuRoutes);
  app.use('/api/orders', orderRoutes);

  app.use((req, res) => {
    res.status(404).json({ error: 'Không tìm thấy API.' });
  });

  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
