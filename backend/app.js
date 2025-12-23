const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("path");

const connectDB = require("./db");
const authRoutes = require("./routes/auth");
const expenseRoutes = require("./routes/expenses");
const adminRoutes = require("./routes/admin");

connectDB();

const app = express();

/* ===================== MIDDLEWARE ===================== */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Allow all origins (safe for your use case)
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(session({
  name: "ded.sid",
  secret: "daily-expenses-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: false   // keep false (Render handles HTTPS)
  }
}));

/* ===================== API ROUTES ===================== */

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/admin", adminRoutes);

/* ===================== FRONTEND ===================== */

// Serve all frontend files from ROOT folder
app.use(express.static(path.join(__dirname, "..")));

// Default page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

// Catch-all (important for single-link setup)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

/* ===================== SERVER ===================== */

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
