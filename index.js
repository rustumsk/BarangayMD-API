require('dotenv').config();
const express = require('express');
const { initDB } = require('./services/db');

const app = express();
app.use(express.json());

app.use('/vitals', require('./routes/vitals'));

app.get('/', (req, res) => {
  res.json({
    message: 'BarangayMD API is running ',
    endpoints: {
      post_vitals: 'POST /vitals',
      get_all: 'GET /vitals'
    }
  });
});

// Keep Render awake
const https = require('https');
setInterval(() => {
  const url = process.env.RENDER_URL;
  if (url) https.get(url).on('error', () => {});
}, 10 * 60 * 1000);

const PORT = process.env.PORT || 3000;

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 BarangayMD API running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize DB:', err);
  process.exit(1);
});

module.exports = app;