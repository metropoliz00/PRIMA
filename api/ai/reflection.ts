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
    const { reflectionText, topic, subject } = req.body || {};

    const systemInstruction = `
Kamu adalah PRIMA AI, evaluator refleksi belajar siswa SD yang empatik dan suportif.
Tugasmu adalah membaca catatan refleksi siswa mengenai topik "${topic || 'Umum'}" (${subject || 'Umum'}).

Berikan apresiasi hangat (2-3 kalimat) yang spesifik terhadap hal yang dipelajari atau kesulitan yang diceritakan siswa.
Puji usahanya dalam berpikir kritis dan sertakan satu kalimat dorongan semangat belajar ke depan.
Gunakan bahasa Indonesia ramah anak SD.
`;

    const fullPrompt = `${systemInstruction}\n\nSiswa menulis refleksi: "${reflectionText}"`;
    const feedbackText = await callGeminiAPI(fullPrompt, apiKey);

    res.status(200).json({
      success: true,
      feedback: feedbackText,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/reflection:', error);
    res.status(200).json({
      success: true,
      feedback: 'Refleksi yang sangat bagus! Kamu sudah belajar dengan tekun hari ini. Tingkatkan terus semangat eksplorasimu! 🌟',
    });
  }
}
