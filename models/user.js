const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: "string", required: true },
  email: { type: "string", required: true, unique: true },
  mobile: { type: "number", required: true, unique: true },
  password: { type: "string", required: true },
});
