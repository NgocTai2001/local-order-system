const express = require('express');
const menuController = require('../controllers/menuController');

const router = express.Router();

router.get('/categories', menuController.listMenuCategories);
router.post('/categories', menuController.createMenuCategory);
router.patch('/categories/:id', menuController.updateMenuCategory);
router.delete('/categories/:id', menuController.deleteMenuCategory);
router.get('/', menuController.listMenu);
router.post('/', menuController.createMenuItem);
router.put('/:id', menuController.updateMenuItem);
router.patch('/:id', menuController.updateMenuItem);
router.delete('/:id', menuController.deleteMenuItem);

module.exports = router;
