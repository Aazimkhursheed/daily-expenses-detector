const express = require("express");
const session = require("express-session");
const cors = require("cors");
const connectDB = require("./db");
const path = require("path");


const authRoutes = require("./routes/auth");
const expenseRoutes = require("./routes/expenses");
const adminRoutes = require("./routes/admin");

connectDB();

const app = express();


app.use(cors({
  origin: [
    "http://localhost:5500",
    "http://127.0.0.1:5500"
  ],
  credentials: true
}));

app.use(express.json());

app.use(session({
  name:"ded.sid",
  secret: "daily-expenses-secret",
  resave: false,
  saveUninitialized: false,
  cookie:{
    httpOnly:true,
    sameSite:"lax",
    secure:false
  }
}));

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/admin", adminRoutes);
app.use(express.static(path.join(__dirname,"../")))

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.get('/',(req,res)=>{
  res.sendFile(path.join(__dirname,"../login.html"))
})

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});

// app.listen(4000, () => {
//   console.log("🚀 Server running on http://localhost:4000");
// });
