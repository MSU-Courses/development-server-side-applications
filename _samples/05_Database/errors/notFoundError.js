import AppError from "./appError.js";

export default class NotFoundError extends AppError {
  constructor(message = "Resource not found", statusCode = 404) {
    super(message, statusCode);
  }
}
