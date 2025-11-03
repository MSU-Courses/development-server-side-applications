import express from "express";

import postController from "../controller/postController.js";
import validationRequest from "../middleware/validationRequest.js";
import { postCreateSchema, postGetSchema } from "../validators/postSchema.js";

const router = express.Router();

router.get("/:id", [postGetSchema, validationRequest], postController.getById);
router.post("/", [postCreateSchema, validationRequest], postController.create);

export default router;
