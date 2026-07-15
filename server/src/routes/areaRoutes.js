const express = require('express');
const areaController = require('../controllers/areaController');
const { requireAdminAuth } = require('../middleware/adminAuth');

const router = express.Router();

router.use(requireAdminAuth);

router.get('/', areaController.listAreas);
router.post('/', areaController.createArea);
router.put('/:id', areaController.updateArea);
router.delete('/:id', areaController.deleteArea);

module.exports = router;
