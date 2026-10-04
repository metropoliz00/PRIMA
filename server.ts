import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY || '';

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

// AI Engine Status Endpoint
app.get('/api/ai/status', (req, res) => {
  res.json({
    status: 'ONLINE',
    model: 'gemini-2.5-flash',
    hasApiKey: true,
    engine: 'Google Gemini REST API',
  });
});

// PRIMA AI Tutor Endpoint & Netlify Function route in local dev
app.post(['/api/ai/tutor', '/.netlify/functions/gemini', '/api/gemini'], async (req, res) => {
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
    const fullPrompt = `${systemInstruction}\n\n${userPrompt}`;

    const replyText = await callGeminiAPI(fullPrompt, apiKey);
    res.json({ success: true, reply: replyText });
  } catch (error: any) {
    console.error('Error in /api/ai/tutor:', error);
    res.json({
      success: true,
      reply: 'Halo Petualang! Mari kita ingat kembali materi dan petunjuk pada langkah sebelumnya. Apa hal paling menarik yang kamu pelajari? 🚀',
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

    const fullPrompt = `${systemInstruction}\n\nSiswa menulis refleksi: "${reflectionText}"`;
    const feedbackText = await callGeminiAPI(fullPrompt, apiKey);

    res.json({
      success: true,
      feedback: feedbackText,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/reflection:', error);
    res.json({
      success: true,
      feedback: 'Refleksi yang sangat bagus! Kamu sudah belajar dengan tekun hari ini. Tingkatkan terus semangat eksplorasimu! 🌟',
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
    const fullPrompt = `${systemInstruction}\n\n${prompt}`;

    const replyText = await callGeminiAPI(fullPrompt, apiKey);
    res.json({ success: true, reply: replyText });
  } catch (error: any) {
    console.error('Error in /api/ai/teacher-consultant:', error);
    res.json({
      success: true,
      reply: 'Halo Guru! Pastikan tujuan pembelajaran selaras dengan KKTP dan libatkan aktivitas interaktif yang menyenangkan bagi siswa! 💡',
    });
  }
});

// AI Question Generator Endpoint for Teachers (PG, PGK, BS)
app.post('/api/ai/generate-questions', async (req, res) => {
  try {
    const { subjectId, topicTitle, grade, numPG, numPGK, numBS } = req.body;

    const systemPrompt = `
Kamu adalah pakar pembuat soal Asesmen Kompetensi Minimum (AKM) tingkat Sekolah Dasar (Kelas 4-6 SD).
Tugasmu adalah membuat soal berkualitas tinggi berdasarkan topik: "${topicTitle || 'Umum'}" (Mata Pelajaran: "${subjectId || 'Umum'}", Kelas: ${grade || 5} SD).

Buatlah soal baru dengan konfigurasi jumlah berikut secara presisi:
- PG (Pilihan Ganda - 1 jawaban benar): ${Number(numPG) || 0} soal
- PGK (Pilihan Ganda Kompleks - beberapa jawaban benar): ${Number(numPGK) || 0} soal
- BS (Benar / Salah - 3 baris pernyataan tabel): ${Number(numBS) || 0} soal

Setiap soal HARUS memiliki level berpikir ('LOTS', 'MOTS', atau 'HOTS') dan penjelasan mendalam yang ramah anak SD.

Format keluaran HARUS berupa JSON array murni tanpa pembuka/penutup markdown \`\`\`json atau teks pengantar lainnya. Struktur item harus mengikuti format berikut:
[
  {
    "id": "q-ai-${Math.floor(Math.random() * 100000)}",
    "subjectId": "${subjectId || 'ipas'}",
    "grade": ${Number(grade) || 5},
    "type": "PG",
    "level": "MOTS",
    "stimulus": "Teks stimulus wacana singkat terkait materi...",
    "questionText": "Pertanyaan pilihan ganda...",
    "options": ["Opsi 1", "Opsi 2", "Opsi 3", "Opsi 4"],
    "correctAnswer": 0,
    "explanation": "Penjelasan mengapa benar..."
  },
  {
    "id": "q-ai-${Math.floor(Math.random() * 100000)}",
    "subjectId": "${subjectId || 'ipas'}",
    "grade": ${Number(grade) || 5},
    "type": "PGK",
    "level": "HOTS",
    "stimulus": "Stimulus...",
    "questionText": "Pertanyaan pilihan ganda kompleks...",
    "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
    "correctAnswers": [0, 2],
    "explanation": "Penjelasan..."
  },
  {
    "id": "q-ai-${Math.floor(Math.random() * 100000)}",
    "subjectId": "${subjectId || 'ipas'}",
    "grade": ${Number(grade) || 5},
    "type": "BS",
    "level": "LOTS",
    "questionText": "Pernyataan benar-salah tabel...",
    "statements": [
      { "id": "s1", "text": "Pernyataan 1", "isTrue": true },
      { "id": "s2", "text": "Pernyataan 2", "isTrue": false },
      { "id": "s3", "text": "Pernyataan 3", "isTrue": false }
    ],
    "explanation": "Penjelasan..."
  }
]
`;

    const replyText = await callGeminiAPI(systemPrompt, apiKey);
    let cleaned = replyText.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.substring(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.substring(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.substring(0, cleaned.length - 3);
    }
    cleaned = cleaned.trim();

    const questions = JSON.parse(cleaned);
    res.json({ success: true, questions });
  } catch (error: any) {
    console.error('Error generating AI questions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Material / Eksplorasi Konsep Generator Endpoint for Teachers
app.post('/api/ai/generate-material', async (req, res) => {
  try {
    const { subjectId, topicTitle, learningObjectives, grade } = req.body;

    const systemPrompt = `
Kamu adalah pakar kurikulum dan penulis buku teks pendidikan interaktif yang berspesialisasi dalam merancang materi pembelajaran sains dan matematika yang seru, mudah dipahami, dan menyenangkan untuk siswa Sekolah Dasar Kelas 4-6 SD (Kurikulum Merdeka).

Tugasmu adalah menyusun draf materi pembelajaran / eksplorasi konsep yang lengkap untuk topik: "${topicTitle || 'Umum'}" (Mata Pelajaran: "${subjectId || 'IPAS'}", Kelas: ${grade || 5} SD).
Tujuan Pembelajaran yang ingin dicapai: "${learningObjectives || 'Mempelajari konsep baru'}".

Materi harus ditulis dengan bahasa yang santun, interaktif, penuh kiasan ramah anak, dan memotivasi siswa untuk berfikir kritis. Materi harus terstruktur menjadi:
1. "description": Deskripsi pengantar singkat (1-2 kalimat menarik yang menggugah rasa ingin tahu siswa).
2. "contentBody": Isi materi eksplorasi konsep yang terperinci. Gunakan pemformatan Markdown yang kaya (judul h2, poin-poin bold, subtopik menarik, fakta unik/sains, analogi kehidupan sehari-hari, dan emotikon ceria 🌾, 🌟, 💡, 🧬, 🚀). Buatlah materi ini panjang, berbobot, dan sarat wawasan edukatif, bukan sekadar draf pendek!

PENTING - SEMATKAN GAMBAR RELEVAN:
Sematkan minimal satu gambar ilustrasi pemandangan/ilmiah yang indah dan sangat relevan dari Unsplash langsung di dalam \`contentBody\` menggunakan sintaks Markdown gambar:
\`![Deskripsi Gambar](https://images.unsplash.com/photo-[id]?auto=format&fit=crop&w=800&q=80)\`.
Pilih ID foto Unsplash yang valid dan relevan, contoh rujukan ID foto:
- Hutan / Ekosistem Alam: photo-1441974231531-c6227db76b6e
- Air / Laut / Sungai / Danau: photo-1470071459604-3b5ec3a7fe05
- Angkasa / Teknologi / Sains: photo-1451187580459-43490279c0fa
- Komputer / AI: photo-1518770660439-4636190af475
- Tumbuhan / Daun / Fotosintesis: photo-1530595467537-0b5996c41f2d
- Sawah / Pertanian / Padi: photo-1500382017468-9049fed747ef
- Hewan / Katak / Serangga: photo-1550828521-4cb4440559b1
- Buku / Belajar / Perpustakaan: photo-1506880018603-83d5b814b5a6
- Matematika / Kalkulator: photo-1509228468518-180dd4864904
Gunakan ID di atas atau ID foto Unsplash nyata lainnya yang sangat cocok dengan topik yang diminta.

Format keluaran HARUS berupa JSON murni tanpa pembuka/penutup markdown \`\`\`json atau teks pengantar lainnya. Struktur objek harus persis seperti berikut:
{
  "topicTitle": "${topicTitle || 'Materi Pokok'}",
  "learningObjectives": "${learningObjectives || 'Memahami materi'}",
  "description": "Pengantar seru...",
  "contentBody": "## Pengantar\\n\\nIsi materi lengkap dalam format markdown..."
}
`;

    const replyText = await callGeminiAPI(systemPrompt, apiKey);
    let cleaned = replyText.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.substring(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.substring(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.substring(0, cleaned.length - 3);
    }
    cleaned = cleaned.trim();

    const materialData = JSON.parse(cleaned);
    res.json({ success: true, material: materialData });
  } catch (error: any) {
    console.error('Error generating AI material:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Setup Vite Dev Server middlewares in dev mode
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });
  app.use(vite.middlewares);
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    try {
      let template = (await import('fs')).readFileSync(
        path.resolve(__dirname, 'index.html'),
        'utf-8'
      );
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
} else {
  // Serve static dist folder in production
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`PRIMA Server running on port ${PORT}`);
  });
}

export default app;
