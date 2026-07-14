const areaService = require('../services/areaService');

function listAreas(req, res) {
  res.json(areaService.listAreas());
}

function createArea(req, res) {
  res.status(201).json(areaService.createArea(req.body));
}

function updateArea(req, res) {
  const id = areaService.normalizeId(req.params.id);
  res.json(areaService.updateArea(id, req.body));
}

function deleteArea(req, res) {
  const id = areaService.normalizeId(req.params.id);
  areaService.deleteArea(id);
  res.json({ ok: true });
}

module.exports = {
  createArea,
  deleteArea,
  listAreas,
  updateArea
};
