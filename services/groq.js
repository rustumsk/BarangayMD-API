const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function summarizeVitals(vitals) {
  const prompt = `
You are a medical assistant for a barangay health kiosk in the Philippines.
Given these patient vitals, give a SHORT and SIMPLE explanation 
that a non-medical person can understand.
Also determine if the status is NORMAL, WARNING, or CRITICAL.

Normal ranges for reference:
- SpO2: 95-100% (below 90% is CRITICAL, 90-94% is WARNING)
- Heart Rate: 60-100 bpm (above 120 or below 50 is CRITICAL)
- Body Temperature: 36.1-37.2°C (above 38°C is WARNING, above 39°C is CRITICAL)
- Blood Pressure: 90/60 to 120/80 is normal (above 140/90 is WARNING)

Vitals received:
- SpO2: ${vitals.spo2}%
- Heart Rate: ${vitals.heart_rate} bpm
- Body Temperature: ${vitals.body_temp}°C
- Humidity: ${vitals.humidity}%
- Blood Pressure: ${vitals.blood_pressure}

Respond ONLY with a JSON object, no extra text, no markdown:
{
  "status": "NORMAL or WARNING or CRITICAL",
  "summary": "Simple 1-2 sentence explanation a patient can understand",
  "advice": "What the patient should do right now"
}`;

  const response = await groq.chat.completions.create({
    model: 'llama3-8b-8192',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2
  });

  const text = response.choices[0].message.content.trim();

  // Clean response in case Groq adds markdown
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

module.exports = { summarizeVitals };