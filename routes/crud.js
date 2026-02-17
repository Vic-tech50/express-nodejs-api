var express = require('express');
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
const db = require("../db"); //import database connection from db.js
// const upload = require("../config/upload");
require("dotenv").config(); //import .env file
var router = express.Router(); //create router object
// const { check, validationResult } = require('express-validator');
// const path = require("path");
// const fs = require("fs");




router.post("/create",
  async (req, res) => {
    try {
      const { name, email, dateOfBirth, address, gender, phone, notes } = req.body;

      // Check if title already exists
      const [existing] = await db.query("SELECT * FROM crud WHERE email = ?", [email]);
      if (existing.length > 0) {
        return res.status(400).json({ message: "Users already exists" });
      }
     
      const date = new Date();

      // Insert into database
      await db.query(
        "INSERT INTO crud (fullname, email, dateofbirth, address, gender, phone, note, createdon) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [name, email, dateOfBirth, address, gender, phone, notes, date]
      );
   
     return res.status(400).json({ message: "Create Done" });
    } catch (err) {
      console.error(err);
      
      res.status(500).json({ message: err.message });
    }
  }
);


// Fetch all records from database
router.get('/fetchfromdatabase', async (req, res) => {
     try {
    const [result] = await db.query("SELECT * FROM crud ORDER BY id DESC");
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('Database error');
  }
})

// Delete record from database
router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM crud WHERE id = ?", [id]);
    res.json({ message: "Record deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send('Database error');
  }
});

// Fetch single record for editing
router.get('/edit/:id',  async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query("SELECT * FROM crud WHERE id = ?", [id]);
    // res.json(result);
    res.json({message: "Fetch single record successful", result: result[0]});
  } catch (error) {
    console.error(error);
    res.status(500).send('Database error');
  }
});


// Update record in database
router.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email} = req.body;
  try {
    await db.query(
      "UPDATE crud SET fullname = ?, email = ? WHERE id = ?",
      [name, email, id]
    );
    res.json({ message: "Record updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send('Database error');
  } 
});

module.exports = router;