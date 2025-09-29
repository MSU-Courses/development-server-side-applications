import { books } from "../db/books.js";

export function getAll() {
  return books;
}

export function findById(id) {
  return books.find((b) => b.id === id) ?? [];
}

export function store(newBook) {
    const book = {
        id: books.length + 1,
        ...newBook,
    }

    books.push(book)

    return book;
}