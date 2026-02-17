
var express = require('express');
const router = express.Router();
// npm install google-auth-library jsonwebtoken dotenv

const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
var dotenv =  require('dotenv'); //npm install dotenv
dotenv.config(); //load .env file

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "Token required" });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    const { email, name, sub: googleId, picture } = payload;

    // Check user in DB
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    let user;

    if (rows.length === 0) {
      // Create user
      await db.query(
        "INSERT INTO users (username, email, google_id, avatar) VALUES (?, ?, ?, ?)",
        [name, email, googleId, picture]
      );

      user = {
        email,
        username: name
      };
    } else {
      user = rows[0];
    }

    // Create your own JWT
    const token = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user
    });

  } catch (err) {
    res.status(401).json({
      success: false,
      message: err.message || "Google authentication failed"
    });
  }
});

module.exports = router;
