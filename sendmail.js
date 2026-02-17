//npm install nodemailer
const nodemailer = require("nodemailer");

const fs = require("fs");
const path = require("path");



const sendEmail = async ({ to, subject, template, html }) => {
   

  const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
  port: 2525,
   auth: {
    user: "6ccfd11bd194ce",
    pass: "576b4acdd4d8d3"
  }
    // auth: {
    //   user: process.env.EMAIL_USER,
    //   pass: process.env.EMAIL_PASS
    // }
  });

   let emailHtml = html;

  // If template is provided, load it
  if (template) {
    emailHtml = fs.readFileSync(
     path.resolve(__dirname, "./", "emails", template),
      "utf8"
    );
  }


  //link to the html file
  //   let html = fs.readFileSync(
  //   path.resolve(__dirname, "./", "emails", template),
  //   "utf8"
  // );

  await transporter.sendMail({
    from: `"Support" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: emailHtml
  });
};

module.exports = sendEmail;
