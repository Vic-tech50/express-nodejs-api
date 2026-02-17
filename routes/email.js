var express = require('express');
const sendEmail = require("../sendmail"); //import email settings

var router = express.Router(); //call express router (important)

router.post("/send-email", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;


    await sendEmail({
      to: email,
      subject: subject,
       template: "email.html",
    //   html: `
    //     <h3>Hello ${name}</h3>
    //     <p>${message}</p>
    //   `
    });

    return res.status(200).json({
      success: true,
      message: "Email sent successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      error: error.message
    });
  }
});

router.post("/email-notice", async (req, res) => {
  try {
   


    await sendEmail({
      to: 'victech@gmail.com',
      subject: 'Testing',
       template: "notice.html",
      // html: `
      //   <h3>Hello</h3>
      //   <p>Cool</p>
      // `
    });

    return res.status(200).json({
      success: true,
      message: "Email sent successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      error: error.message
    });
  }
});


module.exports = router;