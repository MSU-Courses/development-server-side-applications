import express from "express";
import * as bookController from "../controllers/bookController.js";
import logRequest from "../middleware/logRequest.js";
import { idValidator } from "../validators/idValidator.js";
import { validate } from "../middleware/validate.js";
import { param } from "express-validator";

const bookRouter = express.Router();

bookRouter.use(express.urlencoded({ extended: true }));

bookRouter.use(logRequest);

bookRouter.get("/", bookController.list);
bookRouter.get("/create", bookController.create);
bookRouter.get("/:id", [idValidator, validate], bookController.get);
bookRouter.post("/", bookController.store);

export default bookRouter;
