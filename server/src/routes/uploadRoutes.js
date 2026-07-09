const express = require('express');
const uploadController = require('../controllers/uploadController');

const router = express.Router();

router.post('/menu-image', uploadController.uploadMenuImage);

module.exports = router;
