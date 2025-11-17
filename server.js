require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // allow your frontend -> backend (adjust origin in prod)
app.use(express.json()); // parse JSON body

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});


// Create nodemailer transporter using SMTP//
//const transporter = nodemailer.createTransport({
 // host: process.env.SMTP_HOST,
 // port: Number(process.env.SMTP_PORT) || 587,
 // secure: Number(process.env.SMTP_PORT) === 465, // true for 465
 // auth: {
  //  user: process.env.SMTP_USER,
  //  pass: process.env.SMTP_PASS
 // }
//});

// simple health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// contact endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // basic validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'name, email and message are required' });
    }

    // email HTML body
    const html = `
      <h3>New contact request</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
      <p><strong>Message:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>
    `;

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: process.env.TO_EMAIL,
      subject: `Contact request from ${name}`,
      html
    };

    // send mail
    await transporter.sendMail(mailOptions);

    return res.json({ ok: true, message: 'Message sent' });
  } catch (err) {
    console.error('Contact error:', err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
