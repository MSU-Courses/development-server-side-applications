import express from "express";
import "dotenv/config.js";

// import routers
import postRouter from "./router/postRouter.js";
import errorHandler from "./middleware/errorHandler.js";
import requestLogger from "./middleware/requestLogger.js";

const PORT = 3000;

const app = express();

app.use(express.json());

app.use(requestLogger);

app.use("/post", postRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`server started at http://localhost:${PORT}`);
});
