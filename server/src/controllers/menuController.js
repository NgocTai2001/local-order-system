const menuService = require('../services/menuService');
const { normalizeId } = require('../services/orderService');

function listMenu(req, res) {
  const includeUnavailable = req.query.all === '1';
  res.json(menuService.listMenuItems({ includeUnavailable }));
}

function createMenuItem(req, res) {
  const item = menuService.createMenuItem(req.body);
  res.status(201).json(item);
}

function updateMenuItem(req, res) {
  const id = normalizeId(req.params.id, 'Món');
  const item = menuService.updateMenuItem(id, req.body);
  res.json(item);
}

function deleteMenuItem(req, res) {
  const id = normalizeId(req.params.id, 'Món');
  menuService.deleteMenuItem(id);
  res.json({ ok: true });
}

module.exports = {
  createMenuItem,
  deleteMenuItem,
  listMenu,
  updateMenuItem
};
