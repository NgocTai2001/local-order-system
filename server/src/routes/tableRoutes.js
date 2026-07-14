const express = require('express');
const tableController = require('../controllers/tableController');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', tableController.listTables);
router.post('/', tableController.createTable);
router.post('/bulk', tableController.createTablesBulk);
router.patch('/positions', tableController.updateTablePositions);
router.get('/qr/all', asyncHandler(tableController.getAllTableQr));
router.get('/token/:token', tableController.getTableByToken);
router.get('/:id/current-session', tableController.getCurrentSession);
router.get('/:id/current-bill', tableController.getCurrentBill);
router.patch('/:id/close-session', tableController.closeCurrentSession);
router.put('/:id', tableController.updateTable);
router.patch('/:id', tableController.updateTable);
router.delete('/:id', tableController.deleteTable);
router.post('/:id/regenerate-token', tableController.regenerateTableToken);
router.get('/:id/qr', asyncHandler(tableController.getTableQr));

module.exports = router;
