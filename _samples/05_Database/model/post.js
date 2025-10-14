import * as db from "../db/db.js";

export function create({ title, content }) {
  const post = db.exec(
    "insert into posts (title, content)  values (@title, @content)",
    { title, content }
  );

  return post.lastInsertRowid;
}
