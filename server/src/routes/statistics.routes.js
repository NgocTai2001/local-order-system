const express = require('express');
const statisticsController = require('../controllers/statistics.controller');
const { requireAdminAuth } = require('../middleware/adminAuth');

const router = express.Router();

router.use(requireAdminAuth);

router.get('/', statisticsController.getStatistics);

module.exports = router;
