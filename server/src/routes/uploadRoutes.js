const express = require('express');
const uploadController = require('../controllers/uploadController');
const { requireAdminAuth } = require('../middleware/adminAuth');

const router = express.Router();

router.use(requireAdminAuth);

router.post('/menu-image', uploadController.uploadMenuImage);
router.post('/restaurant-image', uploadController.uploadRestaurantImage);

module.exports = router;
