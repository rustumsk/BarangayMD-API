const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function summarizeVitals(vitals) {
  const prompt = `
You are a medical assistant analyzing patient vitals for a health worker in the Philippines.
Given these vitals, provide a clinical assessment for the doctor/health worker.

Normal ranges:
- SpO2: 95-100% (below 90% is CRITICAL, 90-94% is WARNING)
- Heart Rate: 60-100 bpm (above 120 or below 50 is CRITICAL)
- Body Temperature: 36.1-37.2°C (above 38°C is WARNING, above 39°C is CRITICAL)
- Blood Pressure: 90/60 to 120/80 is normal (above 140/90 is WARNING)

Vitals:
- SpO2: ${vitals.spo2}%
- Heart Rate: ${vitals.heart_rate} bpm
- Body Temperature: ${vitals.body_temp}°C
- Humidity: ${vitals.humidity}%
- Blood Pressure: ${vitals.blood_pressure}

Respond ONLY with a JSON object, no extra text, no markdown:
{
  "status": "NORMAL or WARNING or CRITICAL",
  "diagnosis": "Clinical assessment of the patient condition for the doctor",
  "doctor_advice": "Recommended immediate action for the health worker"
}`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2
  });

  const text = response.choices[0].message.content.trim();
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

module.exports = { summarizeVitals };