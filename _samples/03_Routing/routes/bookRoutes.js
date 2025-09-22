import express from 'express'
import * as bookController from '../controllers/bookController.js'

const bookRouter = express.Router();

bookRouter.get('/', bookController.list)
bookRouter.get('/:id', bookController.get)
bookRouter.post('/', bookController.create)

export default bookRouter