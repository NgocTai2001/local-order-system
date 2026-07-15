const express = require('express');
const menuController = require('../controllers/menuController');
const orderController = require('../controllers/orderController');
const optionRoutes = require('./optionRoutes');
const restaurantController = require('../controllers/restaurantController');
const tableController = require('../controllers/tableController');
const { requireAdminAuth } = require('../middleware/adminAuth');

const router = express.Router();

router.use(requireAdminAuth);

router.get('/restaurant', restaurantController.getRestaurantInfo);
router.patch('/restaurant', restaurantController.updateRestaurantInfo);
router.use('/option-groups', optionRoutes);
router.get('/menu', (req, res, next) => {
  req.query.all = '1';
  return menuController.listMenu(req, res, next);
});
router.post('/menu', menuController.createMenuItem);
router.get('/menu/:id/options', menuController.getMenuItemOptions);
router.put('/menu/:id/options', menuController.updateMenuItemOptions);
router.put('/menu/:id', menuController.updateMenuItem);
router.patch('/menu/:id', menuController.updateMenuItem);
router.delete('/menu/:id', menuController.deleteMenuItem);
router.patch('/orders/:id/status', orderController.updateOrder);
router.patch('/orders/:id', orderController.updateOrder);
router.get('/tables/:id/current-session', tableController.getCurrentSession);
router.get('/tables/:id/current-bill', tableController.getCurrentBill);
router.patch('/tables/:id/close-session', tableController.closeCurrentSession);

module.exports = router;
