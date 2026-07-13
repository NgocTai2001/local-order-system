const express = require('express');
const menuController = require('../controllers/menuController');
const optionRoutes = require('./optionRoutes');
const restaurantController = require('../controllers/restaurantController');

const router = express.Router();

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

module.exports = router;
