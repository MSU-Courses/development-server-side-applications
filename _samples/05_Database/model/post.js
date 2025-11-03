import * as db from "../db/db.js";

function create({ title, content }) {
  const post = db.exec(
    "insert into posts (title, content)  values (@title, @content)",
    { title, content }
  );

  return post.lastInsertRowid;
}

function getById(id) {
  const post = db.query("select * from posts where id = @id", { id });
  return post.length > 0 ? post : null;
}

export default {
  create,
  getById, 
}