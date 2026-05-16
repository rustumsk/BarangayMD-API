const express = require('express');
const router = express.Router();
const { summarizeVitals } = require('../services/groq');
const { saveVitals, getLatestVitals, getAllVitals } = require('../services/db');
const { sendAlert } = require('../services/alert');

// ESP32 posts vitals here
// POST /vitals
router.post('/', async (req, res) => {
  try {
    const vitals = req.body;

    // Validate required fields
    const required = ['spo2', 'heart_rate', 'body_temp', 'humidity', 'blood_pressure'];
    for (const field of required) {
      if (vitals[field] === undefined) {
        return res.status(400).json({ error: `Missing field: ${field}` });
      }
    }

    // 1. Get AI summary from Groq
    console.log('🤖 Getting AI summary...');
    const aiResult = await summarizeVitals(vitals);
    console.log('AI Result:', aiResult);

    // 2. Save to PostgreSQL
    await saveVitals(vitals, aiResult);
    console.log('💾 Vitals saved to DB');

    // 3. Send alert if not normal
    if (aiResult.status !== 'NORMAL') {
      console.log(`${aiResult.status} detected — sending alerts...`);
      await sendAlert(vitals, aiResult);
    }

    res.json({
      success: true,
      status: aiResult.status,
      summary: aiResult.summary,
      advice: aiResult.advice
    });

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// MIT App fetches latest vitals here
// GET /vitals/latest
router.get('/latest', async (req, res) => {
  try {
    const data = await getLatestVitals();
    if (!data) {
      return res.json({ message: 'No vitals recorded yet' });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get last 50 records (optional, for history)
// GET /vitals/history
router.get('/history', async (req, res) => {
  try {
    const data = await getAllVitals();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;