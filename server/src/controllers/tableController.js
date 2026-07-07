const tableService = require('../services/tableService');
const { getBaseUrl } = require('../utils/url');

function listTables(req, res) {
  res.json(tableService.listTables(getBaseUrl(req)));
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

function deleteTable(req, res) {
  const id = tableService.normalizeId(req.params.id);
  tableService.deleteTable(id);
  res.json({ ok: true });
}

function regenerateTableToken(req, res) {
  const id = tableService.normalizeId(req.params.id);
  res.json(tableService.regenerateTableToken(id, getBaseUrl(req)));
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
  deleteTable,
  getAllTableQr,
  getTableByToken,
  getTableQr,
  listTables,
  regenerateTableToken,
  updateTable
};
