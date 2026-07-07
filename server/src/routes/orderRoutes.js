const express = require('express');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.get('/', orderController.listOrders);
router.post('/', orderController.createOrder);
router.patch('/:id/status', orderController.updateOrder);
router.patch('/:id', orderController.updateOrder);

module.exports = router;
