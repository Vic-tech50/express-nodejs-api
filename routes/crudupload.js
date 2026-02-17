var express = require('express');
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
const db = require("../db"); //import database connection from db.js
const upload = require("../config/upload");
require("dotenv").config(); //import .env file
var router = express.Router(); //create router object
// const { check, validationResult } = require('express-validator');
const path = require("path");
const fs = require("fs");


router.post("/register",
  upload.fields([{ name: "file" }]),
   async (req, res) => {
    try {
    
      const { name, email, dateOfBirth, address, gender, phone, notes } = req.body;

      // Get uploaded file info
      const imageFile = req.files['file'] ? req.files['file'][0].filename : null;
     

      const [existing] = await db.query("SELECT * FROM crud WHERE email = ?", [email]);
      if (existing.length > 0) {
        return res.status(400).json({ message: "Users already exists" });
      }

      const date = new Date();

      // Insert into database
       await db.query(
        "INSERT INTO crud (fullname, email, dateofbirth, address, gender, phone, note, createdon, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [name, email, dateOfBirth, address, gender, phone, notes, date, imageFile]
      );
       return res.status(200).json({ message: "Create Done" });
    } catch (err) {
      console.error(err);
      
      res.status(500).json({ message: err.message });
     
    }
  }
);

module.exports = router;