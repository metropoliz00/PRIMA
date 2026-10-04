import type { VercelRequest, VercelResponse } from '@vercel/node';

const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyCZ04AE0bSt7btar7j8rgfMTrCXgcxbxvw';

async function callGeminiAPI(promptText: string, key: string): Promise<string> {
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-3.8-flash'];
  
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'aistudio-build',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: promptText }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      if (data && data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }
    } catch (err) {
      console.warn(`Model ${model} fetch exception:`, err);
    }
  }
  throw new Error('All Gemini models failed');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { message, history } = req.body || {};

    const systemInstruction = `
Kamu adalah "PRIMA Teacher AI Assistant", asisten profesional cerdas untuk guru sekolah dasar (SD).
Tugasmu adalah membantu guru dalam:
1. Menyusun kurikulum pembelajaran (Kurikulum Merdeka), tujuan pembelajaran (TP), dan kriteria ketercapaian tujuan pembelajaran (KKTP).
2. Memberikan ide aktivitas interaktif, matching game, atau simulasi laboratorium untuk siswa SD Kelas 4-6.
3. Memberikan solusi konsultasi teknis seputar penggunaan platform PRIMA, manajemen kelas, dan diferensiasi pembelajaran.
4. Menjawab pertanyaan pedagogik dan asesmen formatif dengan ramah, profesional, dan solutif.

Gunakan bahasa Indonesia yang profesional, ramah, dan mendukung pengajar.
`;

    const chatHistory = Array.isArray(history) ? history.map((h: any) => `${h.role === 'user' ? 'Guru' : 'AI'}: ${h.text}`).join('\n') : '';
    const prompt = `${chatHistory}\nGuru: ${message}`;
    const fullPrompt = `${systemInstruction}\n\n${prompt}`;

    const replyText = await callGeminiAPI(fullPrompt, apiKey);
    res.status(200).json({ success: true, reply: replyText });
  } catch (error: any) {
    console.error('Error in /api/ai/teacher-consultant:', error);
    res.status(200).json({
      success: true,
      reply: 'Halo Guru! Pastikan tujuan pembelajaran selaras dengan KKTP dan libatkan aktivitas interaktif yang menyenangkan bagi siswa! 💡',
    });
  }
}
