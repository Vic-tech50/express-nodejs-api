const express = require("express");
const bcrypt = require("bcryptjs");
const { generateOTP } = require("../utils/otp");
const db = require("../db");
const sendEmail = require("../sendmail"); //import email settings

const router = express.Router();

router.post("/send", async (req, res) => {
  const { identifier } = req.body; // email or phone

  if (!identifier) {
    return res.status(400).json({ message: "Identifier required" });
  }

  const otp = generateOTP();
  const otpHash = await bcrypt.hash(otp, 10);

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

  await db.query(
    "INSERT INTO otps (identifier, otp_hash, expires_at) VALUES (?, ?, ?)",
    [identifier, otpHash, expiresAt]
  );

    await sendEmail({
      to: identifier,
      subject: "Your OTP Code",
      html: `
                <h3>Hello ${identifier}</h3>
                <p>Your OTP is: ${otp}</p>
            `
    });

  // 🔹 SEND OTP (for now log it)
  console.log("OTP:", otp);

  res.json({ message: "OTP sent successfully" });
});

router.post("/verify", async (req, res) => {
  const { identifier, otp } = req.body;

  const [rows] = await db.query(
    "SELECT * FROM otps WHERE identifier=? ORDER BY id DESC LIMIT 1",
    [identifier]
  );

  if (!rows.length) {
    return res.status(400).json({ message: "OTP not found" });
  }

  const record = rows[0];

  if (new Date() > record.expires_at) {
    return res.status(400).json({ message: "OTP expired" });
  }

  const isValid = await bcrypt.compare(otp, record.otp_hash);

  if (!isValid) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

    // Optional: delete OTP after success
  await db.query("DELETE FROM otps WHERE id=?", [record.id]);

  res.json({ message: "OTP verified successfully" });
});


module.exports = router;
