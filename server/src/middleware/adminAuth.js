const { httpError } = require('../utils/httpError');
const { isAdminAuthRequired, verifyAdminAccess } = require('../services/supabaseAuthService');

function readBearerToken(req) {
  const header = req.get('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
}

function requireAdminAuth(req, res, next) {
  const token = readBearerToken(req);

  if (isAdminAuthRequired() && !token) {
    return next(httpError(401, 'Vui lòng đăng nhập admin.'));
  }

  verifyAdminAccess(token)
    .then((profile) => {
      req.adminUser = profile;
      next();
    })
    .catch(next);
}

function requireAdminAuthWhen(predicate) {
  return (req, res, next) => {
    if (!predicate(req)) {
      next();
      return;
    }

    requireAdminAuth(req, res, next);
  };
}

module.exports = {
  requireAdminAuth,
  requireAdminAuthWhen
};
