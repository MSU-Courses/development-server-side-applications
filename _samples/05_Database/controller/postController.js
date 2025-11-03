import { validationResult } from "express-validator";
import postModel from "../model/post.js";
import NotFoundError from "../errors/notFoundError.js";

function create(req, res) {
  const { title, content } = req.body;

  const insertedId = postModel.create({
    title,
    content,
  });

  return res.json({
    id: insertedId,
    title,
    content,
  });
}

function getById(req, res) {
  const { id } = req.params;

  const post = postModel.getById(id);

  if (!post) {
    throw new NotFoundError(`Post with id ${id} not found`);
  }

  return res.json(post);
}

export default {
  create,
  getById,
};
