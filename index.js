const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const ejs = require("ejs");
const bcrypt = require("bcrypt");

require("dotenv").config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("./public"));

app.set("view engine", "ejs");

const User = mongoose.model("User", {
  firstName: String,
  lastName: String,
  email: String,
  password: String,
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/signup", (req, res) => {
  res.render("signup");
  // res.json({ message: "Signup page" });
});

app.get("/login", (req, res) => {
  res.render("login");
  // res.json({ message: "Signup page" });
});

app.get("/api/health", async (req, res) => {
  try {
    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -------------------------------------------------  //

app.post("/api/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ firstName, lastName, email, password: hashedPassword });
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (isPasswordCorrect) {
        res.redirect("/");
      }
    } else {
      res.json({ message: "User not found" });
    }
  } catch (error) {
    res.json({ message: "Internal server error" });
  }
});

// const PORT =  || 3000;

app.listen(3000, () => {
  mongoose
    .connect(
      "mongodb+srv://priyanshuqpwp:123@job-haven.3jrk3ny.mongodb.net/?retryWrites=true&w=majority"
    )
    .then(() => console.log("Connected to MongoDB and running on port 3000"))
    .catch((error) => console.log(error));
});
