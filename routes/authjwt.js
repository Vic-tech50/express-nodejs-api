var express = require('express');
//npm install bcryptjs
const bcrypt = require("bcryptjs"); //To Hash The Password
const db = require("../db"); //import database connection from db.js
const jwt = require('jsonwebtoken')
require("dotenv").config(); //npm install dotenv
const authenticateJWT = require('../middleware/jwt')

const rateLimit = require("express-rate-limit");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // only 5 login attempts
  message: {
    status: 429,
    message: "Too many login attempts. Try again later."
  },
});


/**
 * REGISTER
 */

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
  

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


/**
 * LOGIN
 */

router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(422).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Find user
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const user = rows[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ONE response only
    return res.status(200).json({
      success: true,
      message:
        user.role === "admin"
          ? "Admin login successful"
          : "User login successful",
      token,
      user: {
        id: user.id,
        name: user.username,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Could not log out.");
    }
    res.clearCookie("connect.sid");
    res.redirect("/auth/login");
  });
});


router.post('/biometric-unlock', authenticateJWT, (req, res) => {
  res.json({
    success: true,
    message: 'Unlocked successfully',
    user: req.user,
  });
});



router.post("/updateprofile", async (req, res) => {
  try {
    
    const { name, email, id } = req.body;

      // Basic validation
    if (!name || !email) {
      return res.status(422).json({
        success: false,
        message: "All fields are required"
      });
    }


    await db.query("UPDATE users SET username = ?, email = ? WHERE id = ?", [
      name,
      email,
      id

    ]);
  

    res.status(201).json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
