import { param } from "express-validator";

export const idValidator = [
    param('id').isInt().withMessage('ID должен быть целым числом'),
]