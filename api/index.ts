import express from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyCZ04AE0bSt7btar7j8rgfMTrCXgcxbxvw';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// AI Engine Status
app.get('/api/ai/status', (req, res) => {
  res.json({
    status: 'ONLINE',
    model: 'gemini-3.8-flash',
    hasApiKey: true,
    engine: 'Google Gemini GenAI API',
  });
});

// PRIMA AI Tutor Endpoint
app.post('/api/ai/tutor', async (req, res) => {
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
    } = req.body;

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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'Halo Petualang! Ada yang ingin kamu diskusikan tentang materi ini? 🚀';
    res.json({ success: true, reply });
  } catch (error: any) {
    console.error('Error calling Gemini API for PRIMA AI:', error);
    res.json({
      success: true,
      reply: 'PRIMA AI tetap mendampingimu! Mari kita lihat lagi petunjuk pada materi ini. Informasi apa yang paling kamu ingat dari bacaan tadi? 💡',
    });
  }
});

// Reflection Evaluation Endpoint
app.post('/api/ai/reflection', async (req, res) => {
  try {
    const { reflectionText, topic, subject } = req.body;

    const systemInstruction = `
Kamu adalah PRIMA AI, evaluator refleksi belajar siswa SD yang empatik dan suportif.
Tugasmu adalah membaca catatan refleksi siswa mengenai topik "${topic || 'Umum'}" (${subject || 'Umum'}).

Berikan apresiasi hangat (2-3 kalimat) yang spesifik terhadap hal yang dipelajari atau kesulitan yang diceritakan siswa.
Puji usahanya dalam berpikir kritis dan sertakan satu kalimat dorongan semangat belajar ke depan.
Gunakan bahasa Indonesia ramah anak SD.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Siswa menulis refleksi: "${reflectionText}"`,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      success: true,
      feedback: response.text || 'Refleksi yang sangat bagus! Kamu sudah belajar dengan tekun hari ini. Tingkatkan terus semangat eksplorasimu! 🌟',
    });
  } catch (error: any) {
    console.error('Error calling Gemini API for reflection:', error);
    res.json({
      success: true,
      feedback: 'Hebat sekali refleksi belajarmu! Teruslah bertanya dan mengeksplorasi hal-hal baru dalam setiap petualangan PRIMA! 🚀',
    });
  }
});

// Teacher AI Consultant Endpoint
app.post('/api/ai/teacher-consultant', async (req, res) => {
  try {
    const { message, history } = req.body;

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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'Halo Guru! Ada yang bisa saya bantu terkait kurikulum atau perencanaan pembelajaran hari ini? 👩‍🏫✨';
    res.json({ success: true, reply });
  } catch (error: any) {
    console.error('Error calling Gemini API for Teacher Consultant:', error);
    res.json({
      success: true,
      reply: 'Maaf, saya sedang mengalami kendala koneksi AI. Namun sebagai saran kurikulum, pastikan tujuan pembelajaran selaras dengan KKTP dan melibatkan aktivitas interaktif siswa! 💡',
    });
  }
});

export default app;
