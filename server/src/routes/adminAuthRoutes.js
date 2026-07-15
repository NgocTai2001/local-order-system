const express = require('express');
const { requireAdminAuth } = require('../middleware/adminAuth');
const { getPublicAuthConfig } = require('../services/supabaseAuthService');

const router = express.Router();

router.get('/config', (req, res) => {
  res.json(getPublicAuthConfig());
});

router.get('/me', requireAdminAuth, (req, res) => {
  res.json({ user: req.adminUser });
});

module.exports = router;
