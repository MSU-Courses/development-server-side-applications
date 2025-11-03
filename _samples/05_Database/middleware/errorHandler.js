import ValidationError from "../errors/validationError.js";

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isDev = process.env.NODE_ENV === "development";

  const response = {
    status: "error",
    message: err.message || "Internal Server Error",
    ...(isDev && { stack: err.stack }),
  };

  if (err instanceof ValidationError) {
    response.errors = err.errors;
  }

  return res.status(statusCode).json(response);
};

export default errorHandler;
