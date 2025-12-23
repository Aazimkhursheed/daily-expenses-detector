const express = require("express");
const Expense = require("../models/Expense");

const router = express.Router();

/* GET USER EXPENSES */
/* GET USER EXPENSES */
router.get("/:userId", async (req, res) => {
  try {
    if (req.params.userId === 'undefined' || !req.params.userId) {
      return res.status(400).json({ message: "Invalid User ID" });
    }
    const expenses = await Expense.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ADD EXPENSE */
router.post("/", async (req, res) => {
  try {
    const expense = await Expense.create(req.body);
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* DELETE EXPENSE */
router.delete("/:id", async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* CLEAR ALL EXPENSES */
router.delete("/clear/:userId", async (req, res) => {
  try {
    if (req.params.userId === 'undefined' || !req.params.userId) {
      return res.status(400).json({ message: "Invalid User ID" });
    }
    await Expense.deleteMany({ userId: req.params.userId });
    res.json({ message: "All expenses cleared" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



module.exports = router;
