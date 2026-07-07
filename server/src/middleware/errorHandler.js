function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;
  const message = status === 500 ? 'Lỗi máy chủ.' : err.message;

  if (status === 500) {
    console.error(err);
  }

  return res.status(status).json({ error: message });
}

module.exports = { errorHandler };
