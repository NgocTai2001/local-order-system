const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const { httpError } = require('../utils/httpError');

const uploadRoot = process.env.UPLOAD_DIR || '/app/data/uploads';
const menuUploadDir = path.join(uploadRoot, 'menu');
const restaurantUploadDir = path.join(uploadRoot, 'restaurant');
const maxImageBytes = 4 * 1024 * 1024;
const allowedTypes = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};

function saveImage(input, uploadDir, publicPath, prefix) {
  const dataUrl = String(input.dataUrl || '');
  const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);

  if (!match) {
    throw httpError(400, 'Ảnh upload không hợp lệ.');
  }

  const mimeType = match[1];
  const extension = allowedTypes[mimeType];
  const buffer = Buffer.from(match[2], 'base64');

  if (buffer.length === 0 || buffer.length > maxImageBytes) {
    throw httpError(400, 'Ảnh phải nhỏ hơn 4MB.');
  }

  fs.mkdirSync(uploadDir, { recursive: true });

  const fileName = `${prefix}-${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${extension}`;
  const filePath = path.join(uploadDir, fileName);
  fs.writeFileSync(filePath, buffer);

  return {
    url: `${publicPath}/${fileName}`
  };
}

function saveMenuImage(input) {
  return saveImage(input, menuUploadDir, '/uploads/menu', 'menu');
}

function saveRestaurantImage(input) {
  const kind = String(input.kind || 'restaurant')
    .trim()
    .replace(/[^a-z0-9-]/gi, '-')
    .toLowerCase() || 'restaurant';
  return saveImage(input, restaurantUploadDir, '/uploads/restaurant', kind);
}

module.exports = {
  saveMenuImage,
  saveRestaurantImage,
  uploadRoot
};
