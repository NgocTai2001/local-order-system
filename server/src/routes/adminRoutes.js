const express = require('express');
const menuController = require('../controllers/menuController');

const router = express.Router();

router.get('/menu', (req, res, next) => {
  req.query.all = '1';
  return menuController.listMenu(req, res, next);
});
router.post('/menu', menuController.createMenuItem);
router.put('/menu/:id', menuController.updateMenuItem);
router.patch('/menu/:id', menuController.updateMenuItem);
router.delete('/menu/:id', menuController.deleteMenuItem);

module.exports = router;
