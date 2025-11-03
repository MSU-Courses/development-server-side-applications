import logger from "../utils/logger.js";

export default function requestLogger(req, res, next) {
  const { method, originalUrl } = req;
  const timestamp = new Date().toISOString();

  logger.info("Incoming request", {
    method,
    url: originalUrl,
    timestamp,
    ip: req.ip,
  });

  req.on("finish", () => {
    const { statusCode } = res;
    
    logger.info("Request completed", {
      method,
      url: originalUrl,
      statusCode,
      timestamp,
      ip: req.ip,
    });

    logtail.flush();
  });

  next();
}
