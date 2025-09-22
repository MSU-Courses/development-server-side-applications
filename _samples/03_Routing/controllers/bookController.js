import { books } from "../models/books.js";

function list(req, res) {
  res.json(books);
}

function get(req, res) {
  const { id } = req.params;
  const book = books.find((b) => b.id === Number(id));
  res.json(book);
}

function create(req, res) {
  const body = req.body;
  
  const book = {
    id: books.length + 1,
    ...body,
  };

  books.push(book);

  res.json(book);
}

export { list, get, create };
