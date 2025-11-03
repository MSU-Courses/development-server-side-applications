import { validationResult } from "express-validator";
import ValidationError from "../errors/validationError.js";

export default function validationRequest(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorDetails = {};
    errors.array().forEach((err) => {
      errorDetails[err.location] = errorDetails[err.location] || [];
      errorDetails[err.location].push({
        message: err.msg,
        path: err.path,
      });
    });

    return next(new ValidationError("Validation failed", 400, errorDetails));
  }
  next();
}
