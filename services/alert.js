const axios = require('axios');

function buildSMSMessage(vitals, aiResult) {
  const diagnosis = aiResult.diagnosis.substring(0, 100); // trim if too long
  const advice = aiResult.doctor_advice.substring(0, 80);

  return `BarangayMD ${aiResult.status}\n` +
    `HR:${vitals.heart_rate}bpm SpO2:${vitals.spo2}% ` +
    `Temp:${vitals.body_temp}C BP:${vitals.blood_pressure}\n` +
    `${diagnosis}\n` +
    `Action: ${advice}`;
}

async function sendAlert(vitals, aiResult) {
  try {
    const smsMessage = buildSMSMessage(vitals, aiResult);
    console.log(`SMS length: ${smsMessage.length} chars`);
    console.log(`SMS preview: ${smsMessage}`);

    await axios.post(
      'https://unismsapi.com/api/sms',
      {
        recipient: process.env.DOCTOR_PHONE,
        content: smsMessage
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
    const detail = err.response?.data || err.message;
    console.error('SMS failed:', JSON.stringify(detail));
  }

  // Email disabled for now
}

module.exports = { sendAlert };