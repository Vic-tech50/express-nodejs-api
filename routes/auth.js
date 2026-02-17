var express = require('express');
//npm install bcryptjs
const bcrypt = require("bcryptjs"); //To Hash The Password
const db = require("../db"); //import database connection from db.js

// npm install nodemailer crypto
const crypto = require("crypto");
const nodemailer = require("nodemailer");

var router = express.Router();
// const { check, validationResult } = require('express-validator');


//registration api
router.post("/register", async (req, res) => {
  try {
    
    const { name, email, password, role, confirmpassword } = req.body;

      // Basic validation
    if (!name || !email || !password) {
      return res.status(422).json({
        success: false,
        message: "All fields are required"
      });
    }

    
    // Password length check
    if (password.length < 6) {
      return res.status(422).json({
        success: false,
        message: "Password must be at least 6 characters"
      });
    }

  

    const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0) return res.status(400).json({ message: "Email already exists" });

  

    const hashed = await bcrypt.hash(password, 10);
    const date = new Date();

    await db.query("INSERT INTO users (username, email, password, role,date) VALUES (?, ?, ?, ?, ?)", [
      name,
      email,
      hashed,
      role || "user",
      date

    ]);
    // res.redirect('/login')

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//Login api
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(401).json({ message: "Invalid credentials" });

    // Set session data
    // req.session.user = {
    //   id: user.id,
    //   name: user.name,
    //   email: user.email,
    //   address: user.address,
    //   country: user.country,
    //   phone: user.phone,
    //   role: user.role,
    // };

    // Redirect based on role
    if (user.role === "user") {
         return res.status(400).json({ message: "Login Successful" });
    } else {
       return res.status(400).json({ message: "Admin Login Successful" });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  } 
});

router.post("/forgetpassword", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(422).json({
        success: false,
        message: "Email is required"
      });
    }

    const [rows] = await db.query(
      "SELECT id, email FROM users WHERE email = ?",
      [email.toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const user = rows[0];

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token
    await db.query(
      "UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?",
      [token, expires, user.id]
    );

    // Email transporter
    const transporter = nodemailer.createTransport({
       host: "sandbox.smtp.mailtrap.io",
  port: 2525,
   auth: {
    user: "6ccfd11bd194ce",
    pass: "576b4acdd4d8d3"
  }
    });

    // 🔗 Link for React Native (Deep Link or Web)
    const resetLink = `https://yourapp.com/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link expires in 1 hour.</p>
      `
    });

    return res.status(200).json({
      success: true,
      message: "Password reset link sent to your email"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});





module.exports = router;