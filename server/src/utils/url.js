function getBaseUrl(req) {
  if (process.env.PUBLIC_BASE_URL) {
    return process.env.PUBLIC_BASE_URL;
  }

  const forwardedProto = req.get('x-forwarded-proto');
  const forwardedHost = req.get('x-forwarded-host');
  const protocol = (forwardedProto || req.protocol || 'http').split(',')[0].trim();
  const host = (forwardedHost || req.get('host') || 'localhost').split(',')[0].trim();

  return `${protocol}://${host}`;
}

module.exports = { getBaseUrl };
