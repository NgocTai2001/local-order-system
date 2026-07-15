const express = require('express');
const tableController = require('../controllers/tableController');
const { requireAdminAuth } = require('../middleware/adminAuth');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', requireAdminAuth, tableController.listTables);
router.post('/', requireAdminAuth, tableController.createTable);
router.post('/bulk', requireAdminAuth, tableController.createTablesBulk);
router.patch('/positions', requireAdminAuth, tableController.updateTablePositions);
router.get('/qr/all', requireAdminAuth, asyncHandler(tableController.getAllTableQr));
router.get('/token/:token', tableController.getTableByToken);
router.get('/:id/current-session', tableController.getCurrentSession);
router.get('/:id/current-bill', tableController.getCurrentBill);
router.patch('/:id/close-session', requireAdminAuth, tableController.closeCurrentSession);
router.put('/:id', requireAdminAuth, tableController.updateTable);
router.patch('/:id', requireAdminAuth, tableController.updateTable);
router.delete('/:id', requireAdminAuth, tableController.deleteTable);
router.post('/:id/regenerate-token', requireAdminAuth, tableController.regenerateTableToken);
router.get('/:id/qr', requireAdminAuth, asyncHandler(tableController.getTableQr));

module.exports = router;
