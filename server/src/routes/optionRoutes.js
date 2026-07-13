const express = require('express');
const optionController = require('../controllers/optionController');

const router = express.Router();

router.get('/', optionController.listOptionGroups);
router.post('/', optionController.createOptionGroup);
router.patch('/reorder', optionController.reorderOptionGroups);
router.get('/:id', optionController.getOptionGroup);
router.put('/:id', optionController.updateOptionGroup);
router.patch('/:id', optionController.updateOptionGroup);
router.delete('/:id', optionController.deleteOptionGroup);

module.exports = router;
