function notFoundHandler(req, res) {
  res.status(404).json({
    error: "Not Found",
    path: req.originalUrl
  });
}

function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  if (status >= 500) {
    // Keep server-side details in logs only.
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status).json({ error: message });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
