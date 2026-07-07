function normalizeBaseUrl(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

function getBaseUrl(req) {
  const baseOrderUrl = normalizeBaseUrl(process.env.BASE_ORDER_URL);
  if (baseOrderUrl) {
    return baseOrderUrl;
  }

  const publicBaseUrl = normalizeBaseUrl(process.env.PUBLIC_BASE_URL);
  if (publicBaseUrl) {
    return publicBaseUrl;
  }

  const forwardedProto = req.get('x-forwarded-proto');
  const forwardedHost = req.get('x-forwarded-host');
  const protocol = (forwardedProto || req.protocol || 'http').split(',')[0].trim();
  const host = (forwardedHost || req.get('host') || 'localhost').split(',')[0].trim();

  return `${protocol}://${host}`;
}

module.exports = { getBaseUrl };
