const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const ejs = require("ejs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = require("./routes/auth.js");

// require("dotenv").config();

const app = express();

const User = require("./models/user.js");
const Job = require("./models/jobpost.js");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("./public"));

app.set("view engine", "ejs");

// --------------------------------------------------------------------------------------------------------------

const isAuthenticated = (req, res, next) => {
  try {
    const user = jwt.verify(req.headers.token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    res.json({
      status: "FAIL",
      message: "Please login first!",
    });
  }
};

const isAdmin = (req, res, next) => {
  console.log(req.user);
  if (req.user.isAdmin) {
    next();
  } else {
    res.json({
      status: "FAIL",
      message: "You're not allowed to access this page",
    });
  }
};
// ------------------------------view rendering--------------------------------------------- //

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/jobpost", (req, res) => {
  res.render("jobpost");
});

app.get("/health", async (req, res) => {
  try {
    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------------------------------- //

// const signupRoutes = require('./routes/auth');
// app.use('/api', signupRoutes); // Mount the signup routes at '/api'

app.post("/api/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    let user = await User.findOne({ email });
    if (user) {
      res.json({ message: "User already exists" });
    } else {
      res.json({ message: "User created successfully" });
      const newUser = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
      });
      await newUser.save();
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occurred", error });
  }
});

// app.post("/api/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (user) {
//       const isPasswordCorrect = await bcrypt.compare(password, user.password);
//       if (isPasswordCorrect) {
//         const token = jwt.sign(user.toJSON(), "iamtheJWTsecret", {
//           expiresIn: "1h",
//         });
//         res.json({ message: "token generated" });
//       }
//     } else {
//       // res.json({ message: "password incorrect" });
//       res.json({ message: "User doesn't exists" });
//     }
//   } catch (error) {
//     res.json({ message: "error" });
//   }
// });

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      const passwordMatched = await bcrypt.compare(password, user.password);
      if (passwordMatched) {
        const jwToken = jwt.sign(user.toJSON(), "iamthetoken", {
          expiresIn: 60,
        });
        res.json({
          status: "SUCCESS",
          message: "You've logged in successfully",
          // jwToken
        });
      } else {
        res.json({
          status: "FAIL",
          message: "Incorrect password",
        });
      }
    } else {
      res.json({
        status: "FAIL",
        message: "User does not exist",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      status: "FAIL",
      message: "Something went wrong",
    });
  }
});

app.post("/api/jobpost", async (req, res) => {
  try {
    const newJob = new Job(req.body);
    await newJob.save();
    res.status(201).json({ message: "Job listing created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating job listing", error });
  }
});

// --------------------------------------------------------------------------------------------------------------

app.listen(3000, () => {
  mongoose
    .connect(
      "mongodb+srv://priyanshuqpwp:123@job-haven.3jrk3ny.mongodb.net/?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    )
    .then(() => console.log("Connected to MongoDB and running on port 3000"))
    .catch((error) => console.log(error));
});
