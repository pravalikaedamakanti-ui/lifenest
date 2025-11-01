// ===========================
// 🌍 LIFENEST BACKEND SERVER
// ===========================

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const PORT =  process.env.PORT || 5000;



// ===========================
// ⚙️ Middleware
// ===========================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===========================
// 🌐 Serve Frontend (HTML Files)
// ===========================
const frontendPath = path.join(__dirname, "../lifenest-frontend");
app.use(express.static(frontendPath));

// ===========================
// 🗄 PostgreSQL Connection
// ===========================
console.log("🛠 Connecting to PostgreSQL...");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});


pool
  .connect()
  .then(() => console.log("✅ PostgreSQL connected successfully"))
  .catch((err) => console.error("❌ Database connection failed:", err.message));

// ===========================
// 👤 USER SIGNUP ROUTE
// ===========================
app.post("/api/users/signup", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "You have already registered with this email. Please log in instead.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, phone, password)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, phone`,
      [name, email, phone, hashedPassword]
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "pravalikaedamakanti@gmail.com",
        pass: "dtnqnnhbixxelcex",
      },
    });

    const mailOptions = {
      from: '"Lifenest 🩸" <pravalikaedamakanti@gmail.com>',
      to: email,
      subject: "Welcome to Lifenest ❤️",
      text: `Hello ${name},\n\nThank you for signing up for Lifenest!\nYou are now part of a life-saving community.\n\n- Team Lifenest`,
    };

    await transporter.sendMail(mailOptions);
    console.log("📩 Email sent successfully to", email);

    res.status(201).json({
      message: "User registered successfully! A welcome email has been sent.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("🔥 Signup Error:", error);
    res.status(500).json({ message: "Server error during signup" });
  }
});

// ===========================
// 👤 USER LOGIN ROUTE
// ===========================
app.post("/api/users/login", async (req, res) => {
  console.log("🛠 /api/users/login route hit");
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required" });

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "User not found" });

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid password" });

    res.json({ success: true, message: "Login successful", user });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
});

// ===========================
// 🩸 BLOOD DONATION ROUTES
// ===========================
app.post("/api/blood/donate", async (req, res) => {
  try {
    const { name, dob, gender, area, phone, bloodType, healthIssues } = req.body;

    if (!name || !dob || !gender || !area || !phone || !bloodType || !healthIssues) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

    if (age < 18) {
      return res.status(400).json({ success: false, message: "You must be 18 or older to donate blood." });
    }

    if (healthIssues !== "none") {
      return res.status(400).json({ success: false, message: `Cannot donate due to ${healthIssues}` });
    }

    await pool.query(
      `INSERT INTO donations (name, dob, gender, area, phone, blood_type, health_issues, age)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [name, dob, gender, area, phone, bloodType, healthIssues, age]
    );

    console.log("✅ Donation saved:", { name, bloodType });
    res.json({ success: true, message: "Donation recorded successfully!" });
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ success: false, message: "Database error occurred." });
  }
});

// ✅ Get All Blood Donations
app.get("/api/blood/donations", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM donations ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching donations:", err);
    res.status(500).json({ success: false, message: "Database fetch error." });
  }
});

// ===========================
// 🫀 ORGAN DONATION ROUTES
// ===========================
app.post("/api/organ/donate", async (req, res) => {
  try {
    const { name, dob, gender, organ_type, phone, email } = req.body;

    if (!name || !dob || !gender || !organ_type || !phone || !email) {
      return res.status(400).json({ message: "⚠️ All fields are required" });
    }

    await pool.query(
      `INSERT INTO organ_donations (name, dob, gender, organ_type, phone, email)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [name, dob, gender, organ_type, phone, email]
    );

    console.log("✅ Organ donation recorded:", name);
    res.json({ success: true, message: "✅ Organ donation recorded successfully!" });
  } catch (error) {
    console.error("❌ Database Error (Organ Donation):", error.message);
    res.status(500).json({ success: false, message: "Database error while saving organ donation." });
  }
});

app.get("/api/organ/donations", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM organ_donations ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching organ donors:", error.message);
    res.status(500).json({ message: "Database fetch error" });
  }
});

// ===========================
// 🏠 Serve Static Pages
// ===========================
const pages = ["index", "login", "signup", "donors", "about", "contact", "blood", "organ"];
pages.forEach((page) => {
  app.get(`/${page}.html`, (req, res) => {
    res.sendFile(path.join(frontendPath, `${page}.html`));
  });
});
// ===========================
// 📊 DASHBOARD DATA ROUTE
// ===========================
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const bloodResult = await pool.query("SELECT COUNT(*) FROM donations");
    const organResult = await pool.query("SELECT COUNT(*) FROM organ_donations");

    const bloodCount = parseInt(bloodResult.rows[0].count, 10);
    const organCount = parseInt(organResult.rows[0].count, 10);

    res.json({
      success: true,
      bloodCount,
      organCount,
    });
  } catch (error) {
    console.error("❌ Error fetching dashboard stats:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to fetch dashboard data",
    });
  }
});


// ===========================
// 🚀 START SERVER
// ===========================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
