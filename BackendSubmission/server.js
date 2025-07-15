const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const urlRoutes = require("./routes/urlRoutes");
const logger = require("../loggerMiddleware/remoteLogger.js");
const errorHandler = require("./middlewares/errorHandler");

dotenv.config();
const app = express();

app.use(express.json());
app.use(logger);
app.use("/", urlRoutes);
app.use(errorHandler);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT, () => {
      console.log(`Server started on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.log(err));