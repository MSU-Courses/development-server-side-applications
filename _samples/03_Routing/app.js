import express from "express";
import bookRouter from "./routes/bookRoutes.js";

const app = express();

app.use(express.json())

app.use('/book', bookRouter);

app.listen(3000, () => {
  console.log("Server started at http://localhost:3000");
});
