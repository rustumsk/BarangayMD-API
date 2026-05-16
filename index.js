require('dotenv').config();
const express = require('express');
const { initDB } = require('./services/db');

const app = express();
app.use(express.json());

// Routes
app.use('/vitals', require('./routes/vitals'));

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'BarangayMD API is running',
    endpoints: {
      post_vitals: 'POST /vitals',
      get_latest: 'GET /vitals/latest',
      get_history: 'GET /vitals/history'
    }
  });
});

// Keep Render free tier awake during demo
const https = require('https');
setInterval(() => {
  const url = process.env.RENDER_URL;
  if (url) https.get(url).on('error', () => {});
}, 10 * 60 * 1000);

const PORT = process.env.PORT || 3000;

// Initialize DB then start server
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`BarangayMD API running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize DB:', err);
    process.exit(1);
  });

module.exports = app;