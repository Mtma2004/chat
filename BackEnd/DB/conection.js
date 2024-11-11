const url =
  "mongodb+srv://almogany123:mohammed123456$$$@cluster0.1pxja.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// const mongoose = require("mongoose");
import mongoose from "mongoose";

mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
