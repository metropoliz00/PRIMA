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
      if (data && data.error) {
        console.warn(`Model ${model} error:`, data.error.message);
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
    const {
      message,
      topic,
      subject,
      studentQuestion,
      context,
      tutorName,
      communicationStyle,
      rulesAndScaffolding,
      learningGoal,
    } = req.body || {};

    const botName = tutorName || 'PRIMA AI';
    const style = communicationStyle || 'Ramah, sabar, ceria, santun, dan memotivasi untuk siswa Sekolah Dasar (Kelas 4–6 SD)';
    const customRules = rulesAndScaffolding || 'Gunakan metode Socratik/Scaffolding: Berikan apresiasi, petunjuk sederhana atau analogi ramah anak, dan pertanyaan pemandu lanjutan. JANGAN berikan jawaban akhir secara langsung.';

    const systemInstruction = `
Kamu adalah "${botName}", tutor pendamping belajar cerdas berbasis AI untuk siswa Sekolah Dasar (Kelas 4–6 SD).

Mata Pelajaran: ${subject || 'Umum'}
Topik Pembelajaran: ${topic || 'Misi Belajar'}
Tujuan Pembelajaran: ${learningGoal || 'Membantu siswa memahami konsep dasar secara mandiri dan kritis.'}
Gaya Komunikasi: ${style}
Konteks Tambahan: ${context || 'Siswa sedang belajar dan mengeksplorasi materi di platform PRIMA.'}

ATURAN UTAMA & SCAFFOLDING PEDAGOGIK:
${customRules}
1. JANGAN PERNAH LANGSUNG MEMBERIKAN JAWABAN AKHIR jika siswa meminta kunci jawaban atau hasil akhir.
2. Berikan tanggapan yang terstruktur:
   - Apresiasi usaha atau pertanyaan siswa dengan hangat.
   - Berikan petunjuk konseptual, perumpamaan sehari-hari, atau logika sederhana.
   - Akhiri dengan pertanyaan pemandu yang mengajak siswa mencoba memikirkannya sendiri.
3. Gunakan bahasa Indonesia yang santun, ramah, dan mudah dipahami siswa SD (gunakan emotikon ceria secara terukur ✨, 💡, 🚀, 🌟, 🌾).
4. Buat respon ringkas, padat (2-4 kalimat/paragraf pendek) agar siswa nyaman membaca.
`;

    const userPrompt = `Siswa bertanya / menjawab: "${message || studentQuestion}"`;
    const fullPrompt = `${systemInstruction}\n\n${userPrompt}`;

    const replyText = await callGeminiAPI(fullPrompt, apiKey);
    res.status(200).json({ success: true, reply: replyText });
  } catch (error: any) {
    console.error('Error in /api/ai/tutor:', error);
    res.status(200).json({
      success: true,
      reply: 'Halo Petualang! Mari kita ingat kembali materi dan petunjuk pada langkah sebelumnya. Apa hal paling menarik yang kamu pelajari? 🚀',
    });
  }
}
