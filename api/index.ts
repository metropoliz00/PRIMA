import express from 'express';
import type { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function callGemini(promptText: string): Promise<string> {
  const models = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
  for (const model of models) {
    try {
      if (GEMINI_API_KEY) {
        const response = await ai.models.generateContent({
          model,
          contents: promptText,
        });
        if (response && response.text) {
          return response.text;
        }
      }

      // REST fallback
      if (GEMINI_API_KEY) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'User-Agent': 'aistudio-build'
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }]
          })
        });
        const data = await response.json();
        if (data && data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
          return data.candidates[0].content.parts[0].text;
        }
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
