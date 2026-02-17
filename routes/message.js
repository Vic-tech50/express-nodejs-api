const express = require("express");
const router = express.Router();
const db = require("../db");

// GET chat history between two users
router.get("/:user1/:user2", (req, res) => {
  const { user1, user2 } = req.params;

  // Fetch messages where user1 is sender and user2 is receiver OR vice versa
  db.query(
    `SELECT * FROM messages
     WHERE (sender_id=? AND receiver_id=?)
        OR (sender_id=? AND receiver_id=?)
     ORDER BY created_at ASC`,
    [user1, user2, user2, user1],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

module.exports = router;
