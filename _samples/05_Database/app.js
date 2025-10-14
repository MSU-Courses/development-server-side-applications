import express from "express";

import * as postModel from "./model/post.js";

const PORT = 3000;

const app = express();

app.use(express.json());

app.post("/post", (req, res) => {
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
});

app.listen(PORT, () => {
  console.log(`server started at http://localhost:${PORT}`);
});
