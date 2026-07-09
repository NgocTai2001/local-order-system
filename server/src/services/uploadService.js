const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const { httpError } = require('../utils/httpError');

const uploadRoot = process.env.UPLOAD_DIR || '/app/data/uploads';
const menuUploadDir = path.join(uploadRoot, 'menu');
const maxImageBytes = 4 * 1024 * 1024;
const allowedTypes = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};

function saveMenuImage(input) {
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

  fs.mkdirSync(menuUploadDir, { recursive: true });

  const fileName = `menu-${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${extension}`;
  const filePath = path.join(menuUploadDir, fileName);
  fs.writeFileSync(filePath, buffer);

  return {
    url: `/uploads/menu/${fileName}`
  };
}

module.exports = {
  saveMenuImage,
  uploadRoot
};
