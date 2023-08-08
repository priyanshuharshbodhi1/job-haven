const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();
console.log(process.env);

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("./public"));

app.get("/", (req, res) => {
  res.send(__dirname + "/index.html");
});

app.get("/health", async (req, res) => {
  res.status(200).json({ status: "ok" });
});

// const PORT = process.env.PORT || 3000;

app.listen(3000, () => {
  mongoose
    .connect(
      "mongodb+srv://priyanshuqpwp:123@job-haven.3jrk3ny.mongodb.net/?retryWrites=true&w=majority"
    )
    .then(() => console.log(`Server running on http://localhost:3000`))
    .catch((error) => console.log(error));
});
