const crypto = require('crypto');

const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateToken(length = 8) {
  let token = '';
  const bytes = crypto.randomBytes(length);

  for (const byte of bytes) {
    token += alphabet[byte % alphabet.length];
  }

  return token;
}

module.exports = { generateToken };
