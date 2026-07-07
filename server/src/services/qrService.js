const QRCode = require('qrcode');

async function createQrDataUrl(text) {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: 'M',
    margin: 1,
    type: 'image/png',
    width: 320
  });
}

module.exports = { createQrDataUrl };
