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

// -------------------------------------------jwt token middlewares-------------------------------------------------------------------

const isAuthenticated = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // Extract token from "Bearer <token>"
    const user = jwt.verify(token, "iamthetoken");

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

app.get("/jobpost", isAuthenticated, (req, res) => {
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

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      const passwordMatched = await bcrypt.compare(password, user.password);
      if (passwordMatched) {
        const jwToken = jwt.sign(user.toJSON(), "iamthetoken", {
          expiresIn: 6000,
        });
        // Set the Authorization header with the JWT token
        res.setHeader("Authorization", `Bearer ${jwToken}`);
        // console.log(jwToken)

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

app.post("/api/jobpost", isAuthenticated, async (req, res) => {
  try {
    const newJob = new Job(req.body);
    await newJob.save();
    res.status(201).json({ message: "Job listing created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating job listing", error });
  }
});

app.put('/api/editjobpost/:id', isAuthenticated, async (req, res) => {
  try {
    const jobId = req.params.id;
    const { jobPosition, monthlySalary, jobType, remoteOffice, location, jobDescription, skillsRequired, additionalInfo } = req.body;

    const jobPost = await Job.findByIdAndUpdate(jobId, {
      jobPosition,
      monthlySalary,
      jobType,
      remoteOffice,
      location,
      jobDescription,
      skillsRequired,
      additionalInfo,
    });

    if (!jobPost) {
      return res.status(404).json({ message: 'Job post not found' });
    }

    res.status(200).json({ message: 'Job post updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating job post', error });
  }
});

app.get('/api/showjobpost/:id', async (req, res) => {
  try {
    const jobId = req.params.id;

    const jobPost = await Job.findById(jobId);

    if (!jobPost) {
      return res.status(404).json({ message: 'Job post not found' });
    }

    res.status(200).json({ jobPost });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job post details', error });
  }
});

app.get('/api/list-jobs', async (req, res) => {
  try {
    const { skills, jobTitle } = req.query;

    let query = {};

    if (skills) {
      query.skillsRequired = { $regex: new RegExp(skills, 'i') };
    }

    if (jobTitle) {
      query.jobPosition = { $regex: new RegExp(jobTitle, 'i') };
    }

    const jobPosts = await Job.find(query);

    if (jobPosts.length === 0) {
      return res.status(404).json({ message: 'No matching job posts found' });
    }

    res.status(200).json({ jobPosts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job posts', error });
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
