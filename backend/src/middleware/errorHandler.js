export function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    return next(error);
  }

  console.error(error);
  return response.status(error.statusCode ?? 500).json({
    error: error.statusCode ? error.message : "Internal server error",
  });
}
