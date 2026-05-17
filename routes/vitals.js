const express = require('express');
const router = express.Router();
const { summarizeVitals } = require('../services/groq');
const { saveVitals, getAllVitals } = require('../services/db');
const { sendAlert } = require('../services/alert');

// ESP32 posts vitals here
// POST /vitals
router.post('/', async (req, res) => {
  try {
    const vitals = req.body;

    // Check required fields exist
    const required = ['spo2', 'heart_rate', 'body_temp', 'humidity', 'blood_pressure'];
    for (const field of required) {
      if (vitals[field] === undefined) {
        return res.status(400).json({ error: `Missing field: ${field}` });
      }
    }

    // Check values are not zero or empty
    if (
      vitals.spo2 === 0 ||
      vitals.heart_rate === 0 ||
      vitals.body_temp === 0 ||
      vitals.blood_pressure === '--/--' ||
      vitals.blood_pressure === ''
    ) {
      return res.status(400).json({ error: 'Invalid vitals — all values must be non-zero' });
    }


    console.log('🤖 Getting AI diagnosis...');
    const aiResult = await summarizeVitals(vitals);
    console.log('AI Result:', aiResult);

    await saveVitals(vitals, aiResult);
    console.log('💾 Vitals saved to DB');

    if (aiResult.status !== 'NORMAL') {
      console.log(`🚨 ${aiResult.status} detected — sending SMS...`);
      await sendAlert(vitals, aiResult);
    }

    res.json({
      success: true,
      status: aiResult.status,
      diagnosis: aiResult.diagnosis,
      doctor_advice: aiResult.doctor_advice
    });

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// MIT App + Doctor fetches ALL records here
// GET /vitals
router.get('/', async (req, res) => {
  try {
    const data = await getAllVitals();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;