const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
require("dotenv").config(); // ✅ to access .env variables

// ========================
exports.signupUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 🔍 Check if user exists
    const existingUser = await pool.query("SELECT email FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      console.log("⚠️ Existing user found:", email);
      return res.status(409).json({ message: "Account already exists! Please log in." });
    }

    // 🔒 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 💾 Insert user
    await pool.query(
      "INSERT INTO users (name, email, phone, password) VALUES ($1, $2, $3, $4)",
      [name, email, phone, hashedPassword]
    );

    // ✉️ Email setup
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Lifenest ❤️" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to Lifenest 🌿",
      html: `
        <div style="font-family:'Poppins',sans-serif;text-align:center;background:#f0f9ff;padding:30px;border-radius:15px;">
          <img src="https://i.postimg.cc/5NR2yLTr/lifenest-logo.png" alt="Lifenest Logo" width="100" style="margin-bottom:15px;border-radius:50%;">
          <h1 style="color:#007bff;">Welcome to <b>Lifenest</b> 🌿</h1>
          <p>Dear <b>${name}</b>,</p>
          <p>We are extremely happy that you’ve signed up with <b>Lifenest</b> — an organ and blood donation initiative that connects hearts and saves lives.</p>
          <blockquote style="margin:20px auto;font-style:italic;border-left:4px solid #007bff;padding-left:10px;color:#2c3e50;">
            “The smallest act of kindness is worth more than the grandest intention.” — Oscar Wilde
          </blockquote>
          <p>Thank you for joining us. Have a wonderful day ahead! 💖</p>
          <p><b>Be a donor and save a life.</b></p>
          <p style="color:#555;">With warm regards,<br><b>The Lifenest Team ❤️</b></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);

    // ✅ Send single success response
    return res.status(201).json({ message: "Signup successful! Welcome email sent." });

  } catch (error) {
    console.error("❌ Signup error:", error);
    return res.status(500).json({ message: "Signup failed. Please try again later." });
  }
};

// ========================
// LOGIN CONTROLLER
// ========================
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    res.json({ message: "Login successful", user });
  } catch (error) {
    console.error("❌ Login failed:", error);
    res.status(500).json({ error: "Login failed" });
  }
};
