const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
var router = express.Router();

// const app = express();
// app.use(cors());
// app.use(express.json());

const pushTokens = new Set();

router.post('/register-token', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'No token provided' });
  }

  pushTokens.add(token);
  console.log('Registered token:', token);

  res.json({ success: true });
});

router.post('/send-notification', async (req, res) => {
  const { title, body } = req.body;

  const messages = [...pushTokens].map(token => ({
    to: token,
    sound: 'default',
    title,
    body,
  }));

  const response = await fetch(
    'https://exp.host/--/api/v2/push/send',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    }
  );

  const data = await response.json();
  res.json(data);
});

module.exports = router
