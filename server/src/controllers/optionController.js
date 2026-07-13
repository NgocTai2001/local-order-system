const optionService = require('../services/optionService');

function listOptionGroups(req, res) {
  const includeInactive = req.query.all !== '0';
  res.json(optionService.listOptionGroups({ includeInactive }));
}

function getOptionGroup(req, res) {
  const id = optionService.normalizeId(req.params.id, 'Bộ tùy chọn');
  res.json(optionService.getOptionGroup(id));
}

function createOptionGroup(req, res) {
  const group = optionService.createOptionGroup(req.body);
  res.status(201).json(group);
}

function updateOptionGroup(req, res) {
  const id = optionService.normalizeId(req.params.id, 'Bộ tùy chọn');
  res.json(optionService.updateOptionGroup(id, req.body));
}

function deleteOptionGroup(req, res) {
  const id = optionService.normalizeId(req.params.id, 'Bộ tùy chọn');
  optionService.deleteOptionGroup(id);
  res.json({ ok: true });
}

function reorderOptionGroups(req, res) {
  res.json(optionService.reorderOptionGroups(req.body.ids));
}

module.exports = {
  createOptionGroup,
  deleteOptionGroup,
  getOptionGroup,
  listOptionGroups,
  reorderOptionGroups,
  updateOptionGroup
};
