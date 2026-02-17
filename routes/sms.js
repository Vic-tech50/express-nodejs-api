var express = require('express');
var router = express.Router();
// npm install twilio
const twilio = require('twilio');


// Twilio client initialization
const client = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

router.post("/send-sms-notification", async (req, res) => {
  try {
    const { to, body } = req.body;

    if (!to || !body) {
      return res.status(400).json({
        success: false,
        message: "Recipient number and message body are required",
      });
    }

    const message = await client.messages.create({
      body,
      to, // must be a real phone number e.g +234XXXXXXXXXX
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    return res.status(200).json({
      success: true,
      message: "SMS notification sent successfully",
      sid: message.sid,
    });

  } catch (error) {
    console.error("Twilio Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send SMS notification",
    });
  }
});


// // SMS notification route
// router.post('/send-sms-notification', (req, res) => {
//   const { to, body } = req.body; // Expecting 'to' (recipient number) and 'body' (message content) in the request body

//   client.messages
//     .create({
//       body: body || 'Hello from your Express app!', // Default message if none provided
//       to: to || process.env.TWILIO_PHONE_NUMBER, // Default to your Twilio number if no recipient specified
//       from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number
//     })
//     .then((message) => {
//       console.log(`SMS sent: ${message.sid}`);
//       res.status(200).send({ success: true, message: 'SMS notification sent successfully!' });
//     })
//     .catch((error) => {
//       console.error('Error sending SMS:', error);
//       res.status(500).send({ success: false, error: 'Failed to send SMS notification.' });
//     });
// });

module.exports = router