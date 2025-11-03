import { body, param } from "express-validator";

export const postCreateSchema = [
  body("title")
    .isString()
    .withMessage("Title must be a string")
    .isLength({ min: 5, max: 100 })
    .withMessage(
      "Title must be at least 5 characters long and at most 100 characters long"
    ),

  body("content")
    .isString()
    .withMessage("Content must be a string")
    .isLength({ min: 20, max: 5000 })
    .withMessage(
      "Content must be at least 20 characters long and at most 5000 characters long"
    ),
];

export const postGetSchema = [
  param("id").isInt({ gt: 0 }).withMessage("ID must be a positive integer"),
];
