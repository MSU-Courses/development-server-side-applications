import AppError from "./appError.js";

export default class ValidationError extends AppError {
  constructor(message, statusCode = 400, errors = []) {
    super(message, statusCode);
    this.errors = errors;
  }
}
