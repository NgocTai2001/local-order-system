const tableService = require('../services/tableService');
const sessionService = require('../services/sessionService');
const { emitOrderStatusChanged } = require('../socket');
const { getBaseUrl } = require('../utils/url');

function listTables(req, res) {
  res.json(tableService.listTables(getBaseUrl(req), {
    area_id: req.query.area_id
  }));
}

function getTableByToken(req, res) {
  res.json(tableService.getTableByToken(req.params.token, getBaseUrl(req)));
}

function createTable(req, res) {
  res.status(201).json(tableService.createTable(req.body, getBaseUrl(req)));
}

function createTablesBulk(req, res) {
  res.status(201).json(tableService.createTablesBulk(req.body, getBaseUrl(req)));
}

function updateTable(req, res) {
  const id = tableService.normalizeId(req.params.id);
  res.json(tableService.updateTable(id, req.body, getBaseUrl(req)));
}

function updateTablePositions(req, res) {
  res.json(tableService.updateTablePositions(req.body, getBaseUrl(req)));
}

function deleteTable(req, res) {
  const id = tableService.normalizeId(req.params.id);
  tableService.deleteTable(id);
  res.json({ ok: true });
}

function regenerateTableToken(req, res) {
  const id = tableService.normalizeId(req.params.id);
  res.json(tableService.regenerateTableToken(id, getBaseUrl(req)));
}

function getCurrentSession(req, res) {
  const id = tableService.normalizeId(req.params.id);
  res.json(sessionService.getCurrentSession(id));
}

function getCurrentBill(req, res) {
  const id = tableService.normalizeId(req.params.id);
  res.json(sessionService.getCurrentBill(id));
}

function closeCurrentSession(req, res) {
  const id = tableService.normalizeId(req.params.id);
  const bill = sessionService.closeCurrentSession(id);

  for (const order of bill.orders || []) {
    emitOrderStatusChanged({
      ...order,
      status: 'paid',
      table_id: bill.table_id,
      table_name: bill.table
    });
  }

  res.json(bill);
}

async function getTableQr(req, res) {
  const id = tableService.normalizeId(req.params.id);
  res.json(await tableService.getTableQr(id, getBaseUrl(req)));
}

async function getAllTableQr(req, res) {
  res.json(await tableService.getAllTableQr(getBaseUrl(req)));
}

module.exports = {
  createTable,
  createTablesBulk,
  closeCurrentSession,
  deleteTable,
  getAllTableQr,
  getCurrentBill,
  getCurrentSession,
  getTableByToken,
  getTableQr,
  listTables,
  regenerateTableToken,
  updateTable,
  updateTablePositions
};
