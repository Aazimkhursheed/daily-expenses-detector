const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/daily-expense-detector");
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ DB connection failed", err);
    process.exit(1);
  }
}

module.exports = connectDB;
