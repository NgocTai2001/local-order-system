const orderService = require('../services/orderService');
const { emitOrderCreated, emitOrderStatusChanged, emitOrderUpdated } = require('../socket');

function listOrders(req, res) {
  res.json(orderService.listOrders({ status: req.query.status }));
}

function createOrder(req, res) {
  const order = orderService.createOrder(req.body);
  emitOrderCreated(order);
  res.status(201).json(order);
}

function updateOrder(req, res) {
  const id = orderService.normalizeId(req.params.id, 'Đơn hàng');
  const status = req.body.status || 'served';
  const order = orderService.updateOrderStatus(id, status);
  emitOrderUpdated(order);
  emitOrderStatusChanged(order);
  res.json(order);
}

module.exports = {
  createOrder,
  listOrders,
  updateOrder
};
