const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  password: String,
  provider: { type: String, default: "local" },
  role: { type: String, enum: ["user", "admin"], default: "user" }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema,"User");
