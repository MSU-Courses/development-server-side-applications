import express from "express";
import path from "path";
import bookRouter from "./routes/bookRoutes.js";
import logRequest from "./middleware/logRequest.js";

const app = express();

app.set("views", "./views");
app.set("view engine", "ejs");

app.use(express.json());

app.use("/book", bookRouter);

// app.use("/", (req, res) => {
//   return res.render("index");
// });

app.use((req, res) => {
  res.send("404");
});

app.listen(3000, () => {
  console.log("Server started at http://localhost:3000");
});
