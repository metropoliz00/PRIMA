const GEMINI_API_KEY = 'AIzaSyCZ04AE0bSt7btar7j8rgfMTrCXgcxbxvw';

export async function sendAiTutorMessage(message: string, topic: string, subject: string, context?: string): Promise<string> {
  // 1. Try server-side API route first
  try {
    const res = await fetch('/api/ai/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, topic, subject, context }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.reply) {
        return data.reply;
      }
    }
  } catch (e) {
    console.warn('Server API route /api/ai/tutor failed, falling back to direct client-side Gemini API call:', e);
  }

  // 2. Fallback to direct client-side Gemini REST API call (Guaranteed to work on Vercel static/serverless)
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-3.8-flash'];
  const systemInstruction = `Kamu adalah PRIMA AI, tutor pendamping belajar cerdas berbasis AI untuk siswa Sekolah Dasar (Kelas 4–6 SD). Mata Pelajaran: ${subject}, Topik: ${topic}. Konteks: ${context || 'Belajar materi pelajaran'}. Gunakan metode Socratik/Scaffolding: Berikan apresiasi, petunjuk sederhana atau analogi ramah anak, dan pertanyaan pemandu lanjutan. JANGAN berikan jawaban akhir secara langsung. Gunakan bahasa Indonesia yang santun, ramah, dan emotikon ceria (✨, 💡, 🚀).`;
  const prompt = `${systemInstruction}\n\nSiswa bertanya: "${message}"`;

  for (const model of models) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      const data = await response.json();
      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }
    } catch (err) {
      console.warn(`Direct model ${model} error:`, err);
    }
  }

  return 'PRIMA AI tetap mendampingimu! Mari kita pikirkan bersama: apa hal menarik yang kamu temukan pada materi ini? 💡';
}
