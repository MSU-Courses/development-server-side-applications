import { validationResult } from "express-validator";
import { books } from "../db/books.js";
import * as bookModel from "../models/book.js";

export function list(req, res) {
  res.render("books/list", {
    books: bookModel.getAll(),
  });
}

export function get(req, res) {
  const { id } = req.params;

  const book = bookModel.findById(+id);

  res.render("books/index", {
    book,
  });
}

export function create(req, res) {
  res.render("books/create");
}

export function store(req, res) {
  const body = req.body;

  bookModel.store(body);

  res.redirect("/book");
}
