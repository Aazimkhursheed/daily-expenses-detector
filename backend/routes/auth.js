const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

/* REGISTER */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    // Note: Storing password as plain text to match existing insecure login implementation
    // Any email ending in @ded.com becomes an Admin
    const role = (email && email.endsWith("@ded.com")) ? "admin" : "user";
    const newUser = await User.create({
      name,
      email,
      password,
      phone,
      role
    });

    // Auto-login: Set session
    req.session.userId = newUser._id.toString();
    console.log("Auto-logged in new user:", req.session.userId);

    res.status(201).json({
      message: "User created successfully",
      user: newUser,
      role: newUser.role,
      success: true
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* LOGIN (EMAIL) */

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  /* DEMO ADMIN BYPASS REMOVED - User must register admin@ded.com first */

  const user = await User.findOne({ email: email });
  if (!user) return res.status(401).json({ message: "User not found" });

  if (password === user.password) {
    req.session.userId = user._id.toString();
    console.log("Logged in user:", req.session.userId);

    return res.json({
      success: true,
      role: user.role
    });
  } else {
    return res.status(401).json({ message: "Invalid password" });
  }
});

/* CURRENT USER */
router.get("/me", async (req, res) => {
  if (!req.session.userId) return res.status(401).end();
  const user = await User.findById(req.session.userId);
  res.json(user);
});

/* UPDATE USER */
router.put("/update", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: "Not authenticated" });

  try {
    const { name, email, phone, password } = req.body;
    const updateData = { name, email, phone };
    if (password) updateData.password = password;

    const user = await User.findByIdAndUpdate(
      req.session.userId,
      updateData,
      { new: true }
    );

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* LOGOUT */
router.get("/logout", (req, res) => {
  req.session.destroy(() => res.end());
});

/* OTP STORAGE (In-memory for demo) */
const otpStore = new Map();

/* SEND OTP */
router.post("/send-otp", async (req, res) => {
  const { phone } = req.body;

  // Demo code for specific number
  if (phone === "1234567890") {
    console.log(`Demo OTP for ${phone}: 123456`);
    return res.json({ success: true, message: "OTP sent (Demo: 123456)" });
  }

  // Generate random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(phone, otp);

  console.log(`OTP for ${phone}: ${otp}`); // Log for testing

  res.json({ success: true, message: "OTP sent successfully" });
});

/* VERIFY OTP */
router.post("/verify-otp", async (req, res) => {
  const { phone, otp } = req.body;

  // Check demo credentials
  if (phone === "1234567890" && otp === "123456") {
    // Demo bypass - proceed to login/create
  } else {
    // Verify real OTP
    const storedOtp = otpStore.get(phone);
    if (!storedOtp || storedOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    otpStore.delete(phone); // Clear used OTP
  }

  try {
    // Find or Create User
    let user = await User.findOne({ phone: phone });

    if (!user) {
      user = await User.create({
        name: "Mobile User",
        phone: phone,
        role: "user",
        provider: "phone"
      });
    }

    // Login
    req.session.userId = user._id.toString();
    res.json({ success: true, role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
