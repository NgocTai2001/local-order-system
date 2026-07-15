const express = require('express');
const menuController = require('../controllers/menuController');
const { requireAdminAuth, requireAdminAuthWhen } = require('../middleware/adminAuth');

const router = express.Router();
const requireAdminForAllQuery = requireAdminAuthWhen((req) => req.query.all === '1');

router.get('/categories', requireAdminForAllQuery, menuController.listMenuCategories);
router.post('/categories', requireAdminAuth, menuController.createMenuCategory);
router.patch('/categories/:id', requireAdminAuth, menuController.updateMenuCategory);
router.delete('/categories/:id', requireAdminAuth, menuController.deleteMenuCategory);
router.get('/', requireAdminForAllQuery, menuController.listMenu);
router.post('/', requireAdminAuth, menuController.createMenuItem);
router.put('/:id', requireAdminAuth, menuController.updateMenuItem);
router.patch('/:id', requireAdminAuth, menuController.updateMenuItem);
router.delete('/:id', requireAdminAuth, menuController.deleteMenuItem);

module.exports = router;
