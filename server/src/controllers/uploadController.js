const uploadService = require('../services/uploadService');

function uploadMenuImage(req, res) {
  const image = uploadService.saveMenuImage(req.body);
  res.status(201).json(image);
}

module.exports = { uploadMenuImage };
