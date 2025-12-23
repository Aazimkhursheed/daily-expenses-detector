const express = require("express");
const User = require("../models/User");
const Expense = require("../models/Expense");

const router = express.Router();

/* ALL USERS */
router.get("/users", async (req, res) => {
  res.json(await User.find().select("-password"));
});

/* ALL EXPENSES */
router.get("/expenses", async (req, res) => {
  res.json(await Expense.find());
});

/* DELETE USER & THEIR DATA */
router.delete("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    await Expense.deleteMany({ userId: userId });
    res.json({ success: true, message: "User deleted" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

/* MASTER RESET: CLEAR ALL DATA */
router.delete("/reset", async (req, res) => {
  try {
    await User.deleteMany({ role: { $ne: 'admin' } }); // Keep admins
    await Expense.deleteMany({});
    res.json({ success: true, message: "System reset complete" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
