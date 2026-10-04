import express from 'express';
import type { Request, Response } from 'express';

const app = express();
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function callGemini(promptText: string): Promise<string> {
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-3.8-flash'];
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'prima-ai-server'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      });
      const data = await response.json();
      if (data && data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }
      if (data && data.error) {
        console.warn(`Model ${model} error:`, data.error.message);
      }
    } catch (err) {
      console.warn(`Model ${model} fetch exception:`, err);
    }
  }
  throw new Error('All Gemini models failed');
}

app.post('/api/ai/tutor', async (req: Request, res: Response) => {
  try {
    const { message, topic, subject, context, tutorName, communicationStyle, rulesAndScaffolding } = req.body || {};
    const botName = tutorName || 'PRIMA AI';
    const style = communicationStyle || 'Ramah, sabar, ceria, santun, dan memotivasi untuk siswa Sekolah Dasar (Kelas 4–6 SD)';
    const customRules = rulesAndScaffolding || 'Gunakan metode Socratik/Scaffolding: Berikan apresiasi, petunjuk sederhana atau analogi ramah anak, dan pertanyaan pemandu lanjutan. JANGAN berikan jawaban akhir secara langsung.';

    const systemInstruction = `
Kamu adalah "${botName}", tutor pendamping belajar cerdas berbasis AI untuk siswa Sekolah Dasar (Kelas 4–6 SD).
Mata Pelajaran: ${subject || 'Umum'}
Topik Pembelajaran: ${topic || 'Misi Belajar'}
Gaya Komunikasi: ${style}
Konteks: ${context || 'Siswa sedang belajar.'}
ATURAN PEDAGOGIK:
${customRules}
JANGAN berikan jawaban akhir secara langsung. Berikan apresiasi, petunjuk atau analogi, dan pertanyaan pemandu. Gunakan bahasa Indonesia santun dan emotikon ceria (✨, 💡, 🚀).
`;
    const fullPrompt = `${systemInstruction}\n\nSiswa bertanya: "${message}"`;
    const reply = await callGemini(fullPrompt);
    res.json({ success: true, reply });
  } catch (error: any) {
    console.error('API /api/ai/tutor error:', error);
    res.status(500).json({ success: false, error: error.message || 'Gemini API failed' });
  }
});

app.post('/api/ai/reflection', async (req: Request, res: Response) => {
  try {
    const { reflectionText, topic, subject } = req.body || {};
    const prompt = `Kamu adalah PRIMA AI, evaluator refleksi siswa SD. Topik: ${topic} (${subject}). Berikan apresiasi hangat (2-3 kalimat) atas refleksi: "${reflectionText}"`;
    const feedback = await callGemini(prompt);
    res.json({ success: true, feedback });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/ai/teacher-consultant', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body || {};
    const prompt = `Kamu adalah PRIMA Teacher AI Assistant untuk guru SD. Pertanyaan guru: "${message}"`;
    const reply = await callGemini(prompt);
    res.json({ success: true, reply });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default app;
