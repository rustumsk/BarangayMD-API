const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS vitals (
      id SERIAL PRIMARY KEY,
      spo2 FLOAT,
      heart_rate FLOAT,
      body_temp FLOAT,
      humidity FLOAT,
      blood_pressure VARCHAR(20),
      status VARCHAR(20),
      summary TEXT,
      advice TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log(' Database ready');
}

async function saveVitals(vitals, aiResult) {
  await pool.query(
    `INSERT INTO vitals 
      (spo2, heart_rate, body_temp, humidity, blood_pressure, status, summary, advice)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      vitals.spo2,
      vitals.heart_rate,
      vitals.body_temp,
      vitals.humidity,
      vitals.blood_pressure,
      aiResult.status,
      aiResult.summary,
      aiResult.advice
    ]
  );
}

async function getLatestVitals() {
  const result = await pool.query(
    `SELECT * FROM vitals ORDER BY created_at DESC LIMIT 1`
  );
  return result.rows[0] || null;
}

async function getAllVitals() {
  const result = await pool.query(
    `SELECT * FROM vitals ORDER BY created_at DESC LIMIT 50`
  );
  return result.rows;
}

module.exports = { initDB, saveVitals, getLatestVitals, getAllVitals };