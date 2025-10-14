import sqlite from "better-sqlite3";
import path from "node:path";

const db = new sqlite(path.resolve("./db/db.sqlite"), { fileMustExist: true });

export function query(sql, params) {
  return db.prepare(sql).all(params);
}

export function exec(sql, params) {
  return db.prepare(sql).run(params);
}
