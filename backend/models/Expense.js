const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: Number,
  category: String,
  description: String,
  date: Date,
  input_method: { type: String, default: "manual" }
}, { timestamps: true });

module.exports = mongoose.model("Expense", expenseSchema,"Expense");
