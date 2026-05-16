const nodemailer = require('nodemailer');
const axios = require('axios');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendAlert(vitals, aiResult) {
  const message =
`🚨 ${aiResult.status} ALERT — BarangayMD
─────────────────────────
❤️  Heart Rate     : ${vitals.heart_rate} bpm
🩸 SpO2           : ${vitals.spo2}%
🌡️  Body Temp      : ${vitals.body_temp}°C
💧 Humidity       : ${vitals.humidity}%
🩺 Blood Pressure : ${vitals.blood_pressure}
─────────────────────────
📋 Summary : ${aiResult.summary}
💡 Advice  : ${aiResult.advice}
─────────────────────────
Please respond immediately.
Sent by BarangayMD Health Kiosk`;

  try {
    // Send SMS via UniSMS
    await axios.post(
      'https://unismsapi.com/api/sms',
      {
        recipient: process.env.DOCTOR_PHONE, // must be +639XXXXXXXXX format
        content: message
      },
      {
        auth: {
          username: process.env.UNISMS_KEY,
          password: ''
        },
        headers: { 'Content-Type': 'application/json' }
      }
    );
    console.log('SMS sent');
  } catch (err) {
    console.error('SMS failed:', err.message);
  }

  try {
    // Send Email
    await transporter.sendMail({
      from: `BarangayMD <${process.env.EMAIL_USER}>`,
      to: process.env.DOCTOR_EMAIL,
      subject: `🚨 BarangayMD ${aiResult.status} Alert`,
      text: message,
      html: `<pre style="font-family: monospace; font-size: 14px">${message}</pre>`
    });
    console.log('✅ Email sent');
  } catch (err) {
    console.error('Email failed:', err.message);
  }
}

module.exports = { sendAlert };