const express = require('express');
const router = express.Router();
const User = require("../models/user.js");

router.get('/signup', (req, res) => {
    res.render('signup'); // Assuming you have a 'signup.ejs' template in your 'views' folder
  });


router.post("/api/signup", async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;
  
      // Create a new user using the User model
      const newUser = new User({ firstName, lastName, email, password });
  
      let user = await User.findOne({ email });
      if (user) {
        res.json({ message: "User already exists" });
      } else {
        res.json({ message: "User created successfully" });
        await newUser.save();
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "An error occurred" });
    }
  });

module.exports = router;