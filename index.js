import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🧭 Setup path for serving frontend files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Corrected path (capital F + move one level up)
app.use(express.static(path.join(__dirname, "../Frontend")));

// ✉️ Contact form API
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send to principal/school
    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: process.env.DEST_EMAIL,
      subject: `New Contact Form Message: ${subject}`,
      html: `
        <h2>New Inquiry from Website Contact Form</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Subject:</b> ${subject}</p>
        <p><b>Message:</b></p>
        <p>${message}</p>
      `,
    });

    // Auto-reply to sender
    await transporter.sendMail({
      from: `"Dr. Mehnaaz (Principal, BOMIS Pampore)" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Thank you for contacting Birla Open Minds International School, Pampore',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; background: #f9f9f9; padding: 20px; border-radius: 10px;">
          <h3 style="color: #007bff;">Dear ${name},</h3>
          <p>Thank you for reaching out to <strong>Dr. Mehnaaz</strong>, Principal at <strong>Birla Open Minds International School, Pampore</strong>.</p>
          <p>We have received your message and will get back to you shortly.</p>
          <br>
          <p>Warm regards,</p>
          <p><b>Dr. Mehnaaz</b><br>Principal<br>Birla Open Minds International School, Pampore</p>
          <hr>
          <p style="font-size: 12px; color: #777;">This is an automated confirmation message. Please do not reply.</p>
        </div>
      `,
    });

    res.status(200).json({ message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sending email' });
  }
});

// 🌐 Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
