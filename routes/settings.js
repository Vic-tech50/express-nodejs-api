const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
var router = express.Router();
const db = require("../db"); //import database connection from db.js


// Fetch all records from database
router.get('/settingdata', async (req, res) => {
     try {
    const [result] = await db.query("SELECT * FROM settings WHERE id = 1");
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('Database error');
  }
})
module.exports = router
