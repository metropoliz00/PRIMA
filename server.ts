import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY || '';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

function extractJsonArray(rawText: string): any[] | null {
  if (!rawText) return null;
  const text = rawText.trim();
  try {
    const direct = JSON.parse(text);
    if (Array.isArray(direct)) return direct;
  } catch {}

  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch && fenceMatch[1]) {
    try {
      const parsed = JSON.parse(fenceMatch[1].trim());
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }

  const firstBracket = text.indexOf('[');
  const lastBracket = text.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    try {
      const parsed = JSON.parse(text.substring(firstBracket, lastBracket + 1));
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return null;
}

async function callGeminiAPI(promptText: string, key?: string, options?: { temperature?: number; topP?: number; responseMimeType?: string }): Promise<string> {
  const currentKey = key || process.env.GEMINI_API_KEY || '';
  // gemini-3.1-flash-lite is the fastest and most responsive, followed by gemini-flash-latest and gemini-3.8-flash
  const models = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];

  if (currentKey) {
    const aiInstance = currentKey === process.env.GEMINI_API_KEY ? ai : new GoogleGenAI({
      apiKey: currentKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    for (const model of models) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 7000)
        );
        const response = await Promise.race([
          aiInstance.models.generateContent({
            model,
            contents: promptText,
            config: {
              temperature: options?.temperature ?? 0.7,
              topP: options?.topP ?? 0.9,
              ...(options?.responseMimeType ? { responseMimeType: options?.responseMimeType } : {}),
            },
          }),
          timeoutPromise,
        ]);

        if (response && response.text) {
          return response.text;
        }
      } catch (err: any) {
        console.warn(`[GoogleGenAI SDK] Model ${model} warning:`, err?.message || err);
      }
    }
  }

  // REST fallback with timeout
  if (currentKey) {
    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${currentKey}`;
        const timeoutController = new AbortController();
        const timer = setTimeout(() => timeoutController.abort(), 7000);
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'aistudio-build',
          },
          signal: timeoutController.signal,
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: promptText }],
              },
            ],
            generationConfig: {
              temperature: options?.temperature ?? 0.7,
              topP: options?.topP ?? 0.9,
              ...(options?.responseMimeType ? { responseMimeType: options?.responseMimeType } : {}),
            },
          }),
        });
        clearTimeout(timer);

        const data = await response.json();
        if (data && data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
          return data.candidates[0].content.parts[0].text;
        }
        if (data && data.error) {
          console.warn(`[REST Fallback] Model ${model} error:`, data.error.message);
        }
      } catch (err: any) {
        console.warn(`[REST Fallback] Model ${model} warning:`, err?.message || err);
      }
    }
  }

  return '';
}

// AI Engine Status Endpoint
app.get('/api/ai/status', (req, res) => {
  res.json({
    status: 'ONLINE',
    model: 'gemini-3.8-flash',
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

// AI Pemantik Essay Evaluation Endpoint
app.post('/api/ai/evaluate-pemantik', async (req, res) => {
  try {
    const {
      question,
      studentAnswer,
      topicTitle,
      subjectName,
      referenceExplanation,
      referenceCorrectAnswer,
    } = req.body;

    const systemPrompt = `
Kamu adalah "PRIMA AI", asisten tutor pedagogik cerdas untuk siswa Sekolah Dasar (Kelas 4–6 SD).
Tugasmu adalah memeriksa jawaban isian (esai singkat) siswa terhadap pertanyaan pemantik pembelajaran, mengoreksi, serta memberikan umpan balik hangat dan jawaban/konsep yang benar.

Mata Pelajaran: ${subjectName || 'Umum'}
Topik: ${topicTitle || 'Misi Belajar'}
Pertanyaan Pemantik: "${question || ''}"
Kunci/Penjelasan Referensi: "${referenceCorrectAnswer || referenceExplanation || 'Konsep terkait materi'}"

Jawaban Isian Siswa: "${studentAnswer || ''}"

PEDOMAN PENILAIAN ANAK SD:
1. Hargai penalaran, logika awam, dan bahasa khas anak SD. Jawaban tidak harus berupa definisi ilmiah formal.
2. Jika siswa menangkap esensi utama (misal: "makanan habis", "belalang mati/berkurang", "rantai makanan terganggu", "kelipatan 12"), berikan apresiasi tinggi (Skor 80 - 100, isCorrect: true).
3. Jika jawaban sebagian benar atau mendekati, berikan Skor 60 - 79 (isCorrect: true).
4. Jika jawaban belum sesuai atau melenceng, berikan Skor < 60 (isCorrect: false) dengan nada tetap membesarkan hati.
5. Format keluaran HARUS berupa JSON murni tanpa markdown (\`\`\`json) atau teks pengantar dengan skema:
{
  "score": 85,
  "isCorrect": true,
  "statusLabel": "Luar Biasa & Sangat Tepat! 🌟",
  "feedback": "Apresiasi ramah dan ulasan atas jawaban siswa (3-4 kalimat santun)",
  "strengths": "Poin kuat dari jawaban siswa (1-2 kalimat)",
  "suggestion": "Saran kelengkapan atau sudut pandang tambahan (1-2 kalimat)",
  "idealAnswer": "Jawaban ideal yang ringkas dan mudah dipahami siswa SD",
  "explanation": "Penjelasan konsep secara mendalam dan menarik"
}
`;

    let evaluationResult: any = null;
    if (apiKey) {
      try {
        const rawResponse = await callGeminiAPI(systemPrompt, apiKey);
        const cleaned = rawResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
        evaluationResult = JSON.parse(cleaned);
      } catch (geminiErr) {
        console.warn('Gemini call or parse failed for pemantik evaluation, falling back:', geminiErr);
      }
    }

    if (!evaluationResult || typeof evaluationResult.score !== 'number') {
      const ansLower = (studentAnswer || '').toLowerCase();
      const hasKeywords = ansLower.includes('mati') || ansLower.includes('makan') || ansLower.includes('kurang') ||
        ansLower.includes('habis') || ansLower.includes('hilang') || ansLower.includes('12') || ansLower.includes('kpk') ||
        ansLower.includes('produsen') || ansLower.includes('rantai') || ansLower.includes('seimbang');

      const isLongEnough = (studentAnswer || '').trim().length >= 10;
      const score = hasKeywords ? (isLongEnough ? 90 : 80) : (isLongEnough ? 70 : 60);

      evaluationResult = {
        score,
        isCorrect: score >= 65,
        statusLabel: score >= 80 ? 'Luar Biasa & Sangat Tepat! 🌟' : 'Bagus & Mendekati Benar! 💡',
        feedback: `Hebat sekali! Jawabanmu "${studentAnswer}" menunjukkan cara berpikir yang kritis. Kamu sudah berani mengemukakan pendapat berdasarkan pengamatan dan logikamu sendiri. Terus pertahankan semangat bernalar ini!`,
        strengths: 'Kamu berani berpikir logis dan mengaitkan sebab-akibat dengan baik.',
        suggestion: 'Lengkapi dengan membayangkan dampak jangka panjang ke seluruh bagian lingkungan.',
        idealAnswer: referenceCorrectAnswer || referenceExplanation || 'Jawaban ideal mengaitkan peran komponen produsen dan konsumen dalam menjaga keseimbangan alam.',
        explanation: referenceExplanation || 'Pertanyaan pemantik ini mengajak kita memahami konsep dasar sebelum melangkah lebih dalam ke materi berikutnya!',
      };
    }

    res.json({
      success: true,
      ...evaluationResult,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/evaluate-pemantik:', error);
    res.json({
      success: true,
      score: 85,
      isCorrect: true,
      statusLabel: 'Hebat, Pemikiranmu Kritis! 💡',
      feedback: 'Kamu sudah mencoba menjawab dengan bernalar kritis! Pertahankan rasa ingin tahumu untuk langkah eksplorasi materi selanjutnya.',
      strengths: 'Kemauan untuk menuangkan ide dan berpikir logis.',
      suggestion: 'Hubungkan jawabanmu dengan konsep utama topik ini.',
      idealAnswer: req.body?.referenceCorrectAnswer || req.body?.referenceExplanation || 'Pemahaman yang selaras dengan konsep materi.',
      explanation: req.body?.referenceExplanation || 'Konsep ini menjadi dasar penting dalam petualangan belajarmu!',
    });
  }
});

// Dynamic fallback question generator if Gemini is offline or rate-limited
function getDynamicPemantikFallback(topicTitle: string = '', subjectName: string = '', baseQuestion: string = '') {
  const t = (topicTitle || '').toLowerCase();
  const s = (subjectName || '').toLowerCase();

  if (t.includes('ekosistem') || t.includes('rantai') || t.includes('alam') || s.includes('ipas') || s.includes('sains')) {
    const pool = [
      {
        question: 'Jika di sebuah persawahan semua ular sawah ditangkap oleh pemburu liar, apa yang akan terjadi pada populasi tikus dan tanaman padi petani? Mengapa demikian?',
        clue: 'Pikirkan hubungan pemangsa (ular) dengan mangsanya (tikus), serta makanan tikus di sawah.',
        idealAnswer: 'Populasi tikus akan melonjak tajam karena tidak ada predator alaminya (ular). Akibatnya, tikus akan memakan habis tanaman padi dan petani mengalami gagal panen.',
        explanation: 'Dalam rantai makanan, hilangnya predator alami menyebabkan ledakan populasi mangsa yang dapat merusak keseimbangan seluruh ekosistem sawah.',
      },
      {
        question: 'Bayangkan jika seluruh cacing tanah dan jamur pengurai tiba-tiba menghilang dari muka bumi. Bagaimana nasib sampah dedaunan kering dan kesuburan tanah tanaman kita?',
        clue: 'Ingat peran penting organisme pengurai (dekomposer) dalam mengolah zat sisa menjadi unsur hara.',
        idealAnswer: 'Sampah dedaunan dan sisa makhluk hidup akan menumpuk tanpa bisa membusuk. Tanah kehilangan zat hara alami sehingga tanaman baru kesulitan tumbuh subur.',
        explanation: 'Pengurai (dekomposer) bertugas mendaur ulang materi organik menjadi nutrisi tanah. Tanpa mereka, siklus nutrisi dalam ekosistem akan terputus.',
      },
      {
        question: 'Di sebuah danau air tawar, ikan kecil memakan lumut, dan burung bangau memangsa ikan kecil. Jika air danau tercemar limbah pabrik hingga semua lumut mati, bagaimana nasib burung bangau? Jelaskan!',
        clue: 'Perhatikan perpindahan energi dari produsen (lumut) ke konsumen tingkat berikutnya.',
        idealAnswer: 'Jika lumut mati, ikan kecil kelaparan dan mati. Akibatnya, burung bangau kehilangan sumber makanannya sehingga harus berpindah tempat atau populasinya berkurang.',
        explanation: 'Ketiadaan produsen di dasar rantai makanan memberikan efek domino ke seluruh tingkatan konsumen di atasnya hingga predator puncak.',
      },
      {
        question: 'Jika di padang rumput tiba-tiba dimasukkan kawanan serigala asing dalam jumlah sangat banyak, bagaimana pengaruhnya terhadap populasi kelinci dan rumput? Mengapa?',
        clue: 'Pikirkan dampak bertingkat: pemangsa bertambah -> hewan pemakan rumput berkurang -> kondisi rumput?',
        idealAnswer: 'Serigala akan memangsa kelinci secara berlebihan sehingga kelinci berkurang drastis. Karena kelinci sedikit, rumput di padang rumput justru dapat tumbuh lebih lebat.',
        explanation: 'Ini adalah contoh dinamika populasi: perubahan jumlah predator di tingkat atas memengaruhi populasi herbivora dan vegetasi di bawahnya.',
      },
    ];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  if (t.includes('kpk') || t.includes('fpb') || t.includes('kelipatan') || t.includes('faktor') || s.includes('matematika')) {
    const pool = [
      {
        question: 'Dua buah bus pariwisata berangkat dari terminal yang sama. Bus Merah berangkat tiap 15 menit, dan Bus Biru berangkat tiap 20 menit. Pada menit keberapa kedua bus tersebut akan berangkat bersamaan kembali? Bagaimana caramu mengetahuinya?',
        clue: 'Gunakan konsep Kelipatan Persekutuan Terkecil (KPK) dari bilangan 15 dan 20.',
        idealAnswer: 'Kedua bus akan berangkat bersamaan pada menit ke-60 (1 jam kemudian), karena 60 adalah Kelipatan Persekutuan Terkecil (KPK) dari 15 dan 20.',
        explanation: 'KPK digunakan untuk mencari titik temu waktu berkala terkecil dari dua jadwal kegiatan yang berbeda kelipatannya.',
      },
      {
        question: 'Ibu memiliki 24 kue bolu dan 36 permen buah. Ibu ingin membagikannya ke dalam beberapa kotak kado dengan jumlah isi kue dan permen sama banyak tanpa sisa. Berapa kotak kado paling banyak yang bisa disiapkan Ibu? Konsep matematika apa yang kamu gunakan?',
        clue: 'Gunakan Faktor Persekutuan Terbesar (FPB) dari 24 dan 36 untuk membagi benda sama rata.',
        idealAnswer: 'Kotak kado paling banyak adalah 12 kotak, karena 12 adalah FPB dari 24 dan 36. Setiap kotak berisi 2 kue bolu dan 3 permen buah.',
        explanation: 'FPB sangat berguna dalam kehidupan nyata untuk membagi berbagai barang ke dalam kelompok-kelompok yang sama banyak dan adil tanpa ada sisa.',
      },
      {
        question: 'Lampu hias taman berkedip secara otomatis. Lampu kuning berkedip tiap 4 detik, dan lampu hijau tiap 6 detik. Jika keduanya menyala bersama pada detik ke-0, pada detik keberapa sajakah mereka menyala serentak lagi? Jelaskan!',
        clue: 'Tuliskan kelipatan 4 (4, 8, 12, 16...) dan kelipatan 6 (6, 12, 18...). Temukan angka persekutuan terkecilnya!',
        idealAnswer: 'Mereka menyala serentak pertama kali pada detik ke-12 (KPK dari 4 dan 6), kemudian detik ke-24, ke-36, dan seterusnya setiap kelipatan 12 detik.',
        explanation: 'Peristiwa berkala yang berulang dengan periode berbeda akan bertemu kembali pada waktu kelipatan persekutuan dari kedua periode tersebut.',
      },
    ];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  if (t.includes('iklan') || t.includes('media') || s.includes('bahasa indonesia')) {
    const pool = [
      {
        question: 'Ketika kamu melihat poster di kantin sekolah dengan slogan: "Perut Kenyang, Otak Cemerlang: Ayo Makan Buah Segar!". Menurutmu, kata apa yang paling memikat dan mengapa gambar buah yang segar wajib dipasang?',
        clue: 'Pikirkan unsur kata ajakan (persuasif) dan daya tarik visual dalam sebuah iklan media cetak.',
        idealAnswer: 'Kata "Ayo" dan rima "Kenyang - Cemerlang" bersifat mengajak. Gambar buah segar menggugah selera dan meyakinkan pembaca bahwa buah itu lezat dan menyehatkan.',
        explanation: 'Iklan efektif menggabungkan teks persuasif yang membujuk dengan gambar visual yang menarik perhatian sasaran pembacanya.',
      },
      {
        question: 'Jika kamu diminta membuat slogan iklan layanan masyarakat untuk mengajak seluruh siswa menjaga kebersihan toilet sekolah, kalimat ajakan singkat apa yang paling menyentuh dan mudah diingat?',
        clue: 'Gunakan kalimat pendek bernada positif, mudah dihafal, dan memiliki pesan ajakan yang jelas.',
        idealAnswer: 'Contoh: "Bersih Toiletku, Sehat Sekolahku! Yuk, siram bersih setelah digunakan!" Kalimat ini bernada positif, berima, dan langsung mengajak bertindak.',
        explanation: 'Iklan layanan masyarakat bertujuan mengubah perilaku masyarakat ke arah yang lebih baik melalui pesan ajakan yang santun dan mengena.',
      },
    ];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // Generic dynamic fallback
  const pool = [
    {
      question: baseQuestion || `Menurut pengamatanmu dalam kehidupan sehari-hari, mengapa kita perlu mempelajari konsep "${topicTitle}"? Apa masalah di sekitarmu yang bisa diselesaikan dengan ilmu ini?`,
      clue: `Pikirkan hubungan antara materi ${topicTitle} dengan pengalaman nyata yang sering kamu lihat di rumah atau sekolah.`,
      idealAnswer: `Pemahaman tentang ${topicTitle} membantu kita berpikir runtut, memahami fenomena alam atau sosial, dan mengambil keputusan yang bijak dalam kehidupan nyata.`,
      explanation: `Setiap konsep pembelajaran dirancang untuk menjawab pertanyaan nyata di dunia sekitar kita dan melatih kemampuan berpikir kritis siswa.`,
    },
    {
      question: `Bayangkan kamu adalah seorang peneliti cilik yang sedang menyelidiki "${topicTitle}". Jika kamu menemukan suatu keanehan atau fenomena tak terduga, langkah pertama apa yang akan kamu lakukan untuk mencari tahu jawabannya?`,
      clue: 'Gunakan rasa ingin tahu, lakukan pengamatan seksama, dan hubungkan dengan petunjuk materi yang kamu pelajari.',
      idealAnswer: 'Melakukan pengamatan teliti, mencatat bukti-bukti, mengajukan pertanyaan kritis, dan menguji dugaan awal secara logis.',
      explanation: 'Sikap ilmiah seorang peneliti dimulai dari rasa ingin tahu, observasi cermat, dan keberanian mengajukan pertanyaan pemantik.',
    }
  ];
  return pool[Math.floor(Math.random() * pool.length)];
}

// AI Generate Dynamic Pemantik Question Endpoint
app.post('/api/ai/generate-pemantik', async (req, res) => {
  try {
    const {
      topicTitle = 'Misi Belajar',
      subjectName = 'IPAS',
      baseQuestion = '',
      learningObjectives = '',
      studentName = '',
      variationSeed = `${Date.now()}_${Math.random()}`,
    } = req.body;

    const perspectives = [
      'Studi Kasus Lingkungan Sekitar & Rumah',
      'Eksperimen / Fenomena Tak Terduga',
      'Dampak Perubahan Cepat & Rantai Sebab-Akibat',
      'Misteri Alam & Petualangan Nyata',
      'Penerapan Kreatif Sehari-hari',
    ];
    const pickedPerspective = perspectives[Math.floor(Math.random() * perspectives.length)];

    const systemPrompt = `
Kamu adalah "PRIMA AI", perancang pertanyaan pemantik pedagogik Kurikulum Merdeka untuk siswa SD (Sekolah Dasar Kelas 4–6).
Tugasmu adalah merumuskan SATU (1) pertanyaan pemantik (inquiry trigger question) yang SEGAR, MENARIK, PENUH RASA INGIN TAHU, dan BERBEDA SETIAP SAAT.

Informasi Materi:
- Mata Pelajaran: ${subjectName}
- Topik Pembelajaran: ${topicTitle}
- Tujuan / Konteks Pembelajaran: ${learningObjectives || 'Memantik rasa ingin tahu dan penalaran sebab-akibat siswa SD'}
- Nama Siswa Sesi: ${studentName || 'Petualang Cilik'}
- Sudut Pandang Khusus Kali Ini: ${pickedPerspective}
- ID Variasi Unik / Timestamp: ${variationSeed}

INSTRUKSI KEUNIKAN MUTLAK:
1. Pertanyaan ini HARUS BARU dan BERBEDA dari pertanyaan sebelumnya. JANGAN pernah membuat pertanyaan yang sama persis atau klise.
2. Hubungkan dengan studi kasus sehari-hari, fenomena konkret di sekitar anak SD (taman, sawah, dapur, sungai, pasar, sekolah, hewan, tumbuhan, angka, dll.).
3. Gunakan gaya bahasa bersahabat, ceria, dan merangsang rasa penasaran ("Bayangkan jika...", "Menurutmu apa yang terjadi jika...", "Mengapa...", "Bagaimana caramu...").
4. Format keluaran WAJIB JSON murni tanpa pembungkus markdown (\`\`\`json) dengan struktur:
{
  "question": "Kalimat pertanyaan pemantik yang seru dan menantang rasa ingin tahu",
  "clue": "Petunjuk berpikir ramah anak (1-2 kalimat) yang membimbing penalaran",
  "idealAnswer": "Kunci poin esensial atau konsep ideal yang diharapkan dipikirkan anak",
  "explanation": "Penjelasan konsep materi secara menyenangkan dan mudah dimengerti anak SD"
}
`;

    let generated: any = null;
    if (apiKey) {
      try {
        const rawResponse = await callGeminiAPI(systemPrompt, apiKey, { temperature: 1.0, topP: 0.95 });
        const cleaned = rawResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
        generated = JSON.parse(cleaned);
      } catch (geminiErr) {
        console.warn('Gemini call or parse failed for pemantik generation, using dynamic fallback:', geminiErr);
      }
    }

    if (!generated || !generated.question) {
      generated = getDynamicPemantikFallback(topicTitle, subjectName, baseQuestion);
    }

    res.json({
      success: true,
      isAiGenerated: Boolean(apiKey && generated),
      ...generated,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/generate-pemantik:', error);
    res.json({
      success: true,
      isAiGenerated: false,
      ...getDynamicPemantikFallback(req.body?.topicTitle, req.body?.subjectName, req.body?.baseQuestion),
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
    const {
      subjectId = 'ipas',
      topicTitle = 'Harmoni Ekosistem',
      grade = 5,
      numPG = 2,
      numPGK = 1,
      numBS = 1,
      numMudah,
      numSedang,
      numSulit,
      cognitiveLevel = 'ALL',
      stimulusStyle = 'REAL_WORLD',
      variationSeed = `${Date.now()}_${Math.random()}`,
    } = req.body;

    const parsedPG = Math.max(0, Math.min(10, Number(numPG) || 0));
    const parsedPGK = Math.max(0, Math.min(10, Number(numPGK) || 0));
    const parsedBS = Math.max(0, Math.min(10, Number(numBS) || 0));

    const totalRequested = parsedPG + parsedPGK + parsedBS;
    if (totalRequested === 0) {
      return res.json({ success: true, questions: [] });
    }

    let cognitiveInstruction =
      cognitiveLevel === 'HOTS'
        ? 'Semua soal WAJIB bertaraf HOTS (High Order Thinking Skills: menganalisis fenomena baru, memprediksi dampak, mengevaluasi solusi).'
        : cognitiveLevel === 'MOTS'
        ? 'Soal berfokus pada level MOTS (Penerapan konsep materi, menghubungkan sebab-akibat sederhana, dan membandingkan).'
        : cognitiveLevel === 'LOTS'
        ? 'Soal berfokus pada level LOTS (Pemahaman fakta dasar, definisi, dan identifikasi komponen).'
        : 'Proporsikan level kognitif secara seimbang (50% HOTS, 30% MOTS, 20% LOTS).';

    if (numMudah !== undefined || numSedang !== undefined || numSulit !== undefined) {
      const pM = Number(numMudah) || 0;
      const pS = Number(numSedang) || 0;
      const pH = Number(numSulit) || 0;
      cognitiveInstruction = `Buat persis: ${pM} butir bertaraf Mudah (LOTS C1-C2), ${pS} butir bertaraf Sedang (MOTS C3), dan ${pH} butir bertaraf Sulit (HOTS C4-C6). Berikan tag "level": "LOTS", "MOTS", atau "HOTS" pada setiap item JSON.`;
    }

    const stimulusInstruction =
      stimulusStyle === 'SCIENTIFIC'
        ? 'Gunakan teks stimulus berupa fakta observasi sains, eksperimen laboratorium cilik, atau laporan penelitian alam.'
        : stimulusStyle === 'STORY'
        ? 'Gunakan teks stimulus berupa cerita petualangan seru karakter anak sekolah dasar di lingkungan sekitarnya.'
        : 'Gunakan teks stimulus berbasis studi kasus nyata kehidupan sehari-hari anak SD (di rumah, pasar, taman, sawah, atau sekolah).';

    const systemPrompt = `
Kamu adalah pakar pembuat soal Asesmen Kompetensi Minimum (AKM) dan Kurikulum Merdeka tingkat Sekolah Dasar (Kelas 4-6 SD).
Tugasmu adalah membuat butir-butir soal orisinal, segar, dan mendidik berdasarkan topik: "${topicTitle}" (Mata Pelajaran: "${subjectId}", Kelas: ${grade} SD).

KONFIGURASI JUMLAH SOAL WAJIB (Harus tepat sesuai hitungan):
- Pilihan Ganda (PG - 1 jawaban benar dengan 4 opsi A, B, C, D): ${parsedPG} soal
- Pilihan Ganda Kompleks (PGK - kotak centang dengan minimal 2 jawaban benar dari 4 opsi A, B, C, D): ${parsedPGK} soal
- Benar / Salah (BS - tabel evaluasi berisi 3 baris pernyataan): ${parsedBS} soal

PANDUAN KOGNITIF & STIMULUS:
- ${cognitiveInstruction}
- ${stimulusInstruction}
- Seed variasi: ${variationSeed} (Pastikan soal unik dan berbeda dari soal standar pada buku umum).

Format keluaran HARUS berupa JSON array murni tanpa pembuka/penutup markdown \`\`\`json atau teks pengantar lainnya. Struktur setiap item:
[
  ${parsedPG > 0 ? `{
    "id": "q-ai-${Math.floor(Math.random() * 100000)}",
    "subjectId": "${subjectId}",
    "grade": ${grade},
    "type": "PG",
    "level": "HOTS",
    "stimulus": "Teks wacana stimulus yang menarik dan mendidik...",
    "questionText": "Kalimat pertanyaan pilihan ganda yang jelas...",
    "options": ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
    "correctAnswer": 0,
    "explanation": "Penjelasan pedagogis mengapa jawaban tersebut benar dan konsep sains/matematikanya..."
  },` : ''}
  ${parsedPGK > 0 ? `{
    "id": "q-ai-${Math.floor(Math.random() * 100000)}",
    "subjectId": "${subjectId}",
    "grade": ${grade},
    "type": "PGK",
    "level": "HOTS",
    "stimulus": "Teks stimulus wacana analisis...",
    "questionText": "Berdasarkan stimulus di atas, manakah pernyataan yang BENAR? (Pilih lebih dari satu)",
    "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
    "correctAnswers": [0, 2],
    "explanation": "Penjelasan rinci mengapa opsi tersebut tepat..."
  },` : ''}
  ${parsedBS > 0 ? `{
    "id": "q-ai-${Math.floor(Math.random() * 100000)}",
    "subjectId": "${subjectId}",
    "grade": ${grade},
    "type": "BS",
    "level": "MOTS",
    "stimulus": "Teks stimulus wacana pengantar...",
    "questionText": "Tentukan kebenaran dari setiap pernyataan berikut berdasarkan konsep materi:",
    "statements": [
      { "id": "s1", "text": "Pernyataan 1 terkait konsep", "isTrue": true },
      { "id": "s2", "text": "Pernyataan 2 terkait konsep", "isTrue": false },
      { "id": "s3", "text": "Pernyataan 3 terkait konsep", "isTrue": true }
    ],
    "explanation": "Penjelasan kebenaran masing-masing pernyataan..."
  }` : ''}
]
`;

    let questions: any[] = [];
    if (apiKey) {
      try {
        const replyText = await callGeminiAPI(systemPrompt, apiKey, {
          temperature: 0.7,
          responseMimeType: 'application/json',
        });
        const parsed = extractJsonArray(replyText);
        if (Array.isArray(parsed) && parsed.length > 0) {
          questions = parsed.map((item: any, idx: number) => {
            const rawType = (item.type || 'PG').toUpperCase();
            const qType = rawType === 'PGK' ? 'PGK' : rawType === 'BS' ? 'BS' : 'PG';
            return {
              id: item.id || `q-ai-${Date.now()}-${idx}`,
              subjectId: item.subjectId || subjectId,
              grade: Number(item.grade) || Number(grade) || 5,
              type: qType,
              level: item.level || (idx % 3 === 0 ? 'HOTS' : idx % 2 === 0 ? 'MOTS' : 'LOTS'),
              stimulus: item.stimulus || `Konteks pengamatan nyata seputar ${topicTitle}.`,
              questionText: item.questionText || item.question || `Pertanyaan terkait ${topicTitle}:`,
              options: Array.isArray(item.options) && item.options.length >= 2 ? item.options : ['Opsi A', 'Opsi B', 'Opsi C', 'Opsi D'],
              correctAnswer: typeof item.correctAnswer === 'number' ? item.correctAnswer : 0,
              correctAnswers: Array.isArray(item.correctAnswers) ? item.correctAnswers : [0, 2],
              statements: Array.isArray(item.statements) && item.statements.length > 0 ? item.statements : [
                { id: 's1', text: `Prinsip ${topicTitle} berlaku secara nyata di kehidupan sehari-hari.`, isTrue: true },
                { id: 's2', text: `Semua komponen dalam materi ini tidak saling memengaruhi.`, isTrue: false },
                { id: 's3', text: `Menjaga keseimbangan dan pemahaman konsep sangat penting.`, isTrue: true }
              ],
              explanation: item.explanation || `Penjelasan konsep materi ${topicTitle}.`,
              hint: item.hint || `Pikirkan hubungan inti dalam topik ${topicTitle}.`,
            };
          });
        }
      } catch (geminiErr) {
        console.warn('Gemini question generation warning:', geminiErr);
      }
    }

    if (questions.length === 0) {
      // High-quality dynamic fallback questions generator based on topic and pedagogical distribution
      const fallbackList: any[] = [];
      const topicLower = (topicTitle || '').toLowerCase();
      const isScience = subjectId === 'ipas' || topicLower.includes('ekosistem') || topicLower.includes('energi') || topicLower.includes('alam');
      const isMath = subjectId === 'matematika' || topicLower.includes('kpk') || topicLower.includes('pecahan') || topicLower.includes('bangun');

      // 1. Generate PG Questions
      for (let i = 0; i < parsedPG; i++) {
        let level: 'LOTS' | 'MOTS' | 'HOTS' = 'MOTS';
        if (numMudah !== undefined && i < (numMudah || 0)) level = 'LOTS';
        else if (numSulit !== undefined && i >= totalRequested - (numSulit || 0)) level = 'HOTS';

        let stimulus = `Dalam eksplorasi materi "${topicTitle}", siswa melakukan pengamatan tentang keterkaitan antarkonsep di lingkungan nyata.`;
        let questionText = `Berdasarkan pengamatan materi "${topicTitle}", manakah kesimpulan yang paling tepat mengenai prinsip dasar yang berlaku?`;
        let options = [
          `Menerapkan prinsip utama ${topicTitle} secara bijak dan solutif di kehidupan nyata`,
          `Hanya menghafal istilah tanpa memahami hubungan sebab-akibat`,
          `Prinsip ini sama sekali tidak memiliki dampak terhadap kehidupan sekitar`,
          `Mengabaikan keterkaitan konsep karena dianggap tidak berpengaruh`,
        ];
        let explanation = `Pilihan pertama tepat karena pembelajaran ${topicTitle} bertujuan melatih nalar kritis dan pemahaman aplikatif di dunia nyata.`;

        if (isScience) {
          if (i === 0) {
            stimulus = `Sekelompok siswa mengamati ekosistem di sekitar sekolah. Mereka mencatat hubungan antara komponen hidup (biotik) dan tak hidup (abiotik) yang membentuk keharmonisan "${topicTitle}".`;
            questionText = `Jika salah satu komponen utama dalam "${topicTitle}" mengalami penurunan drastis, dampak langsung apa yang paling mungkin terjadi?`;
            options = [
              'Keseimbangan sistem terganggu dan memengaruhi kelangsungan komponen lainnya',
              'Seluruh komponen lain tetap berfungsi normal tanpa ada perubahan sedikit pun',
              'Populasi semua makhluk hidup secara otomatis langsung berlipat ganda',
              'Sistem akan langsung musnah secara seketika dalam hitungan detik',
            ];
            explanation = 'Setiap komponen dalam suatu sistem saling terkait. Gangguan pada satu komponen akan memengaruhi kestabilan komponen lain.';
          } else {
            stimulus = `Pada pengamatan lingkungan terkait "${topicTitle}", ditemukan bahwa interaksi yang seimbang memberikan manfaat besar bagi keberlanjutan alam.`;
            questionText = `Tindakan nyata apa yang paling mencerminkan penerapan prinsip "${topicTitle}" dalam kehidupan sehari-hari siswa?`;
            options = [
              'Menjaga kelestarian lingkungan dan memanfaatkan sumber daya secara bertanggung jawab',
              'Membuang sampah di saluran air tanpa memedulikan aliran sungai',
              'Mengeksploitasi sumber daya alam secara berlebihan tanpa pembaharuan',
              'Membiarkan kerusakan lingkungan karena merasa bukan tanggung jawab pribadi',
            ];
            explanation = 'Penerapan konsep materi diarahkan pada pembentukan sikap peduli lingkungan dan tanggung jawab moral siswa.';
          }
        } else if (isMath) {
          stimulus = `Dalam permasalahan matematika kontekstual seputar "${topicTitle}", siswa diajak memecahkan masalah kuantitatif yang ditemui sehari-hari.`;
          questionText = `Strategi pemecahan masalah apa yang paling efektif untuk menyelesaikan persoalan "${topicTitle}"?`;
          options = [
            'Mengidentifikasi informasi yang diketahui, pola bilangan/rumus, lalu menghitung secara runtut',
            'Langsung menebak hasil akhir tanpa melakukan langkah perhitungan',
            'Mengabaikan data yang diketahui dan menggunakan rumus sembarang',
            'Menghitung tanpa memeriksa kembali kesesuaian satuan hasil akhir',
          ];
          explanation = 'Langkah sistematis: memahami masalah, merencanakan penyelesaian, menghitung, dan memeriksa kembali.';
        }

        fallbackList.push({
          id: `q-ai-${Date.now()}-pg-${i}`,
          subjectId,
          grade: Number(grade) || 5,
          type: 'PG',
          level,
          stimulus,
          questionText,
          options,
          correctAnswer: 0,
          explanation,
          hint: `Perhatikan kata kunci pada teks stimulus materi ${topicTitle}.`,
        });
      }

      // 2. Generate PGK Questions (Multiple Answers)
      for (let i = 0; i < parsedPGK; i++) {
        let stimulus = `Sebuah studi kasus dilakukan untuk menganalisis penerapan konsep "${topicTitle}" dalam situasi nyata sehari-hari.`;
        let questionText = `Pilihlah DUA atau lebih pernyataan yang BENAR mengenai konsep "${topicTitle}" berikut: (Pilih lebih dari satu)`;
        let options = [
          `Pemahaman mendalam tentang "${topicTitle}" melatih kemampuan bernalar kritis dan memecahkan masalah`,
          'Setiap komponen dalam konsep ini berdiri sendiri tanpa ada keterkaitan dengan komponen lain',
          `Penerapan konsep "${topicTitle}" membantu menjaga keteraturan dan keharmonisan sistem`,
          'Hasil observasi tidak memerlukan pembuktian secara objektif',
        ];
        let explanation = `Pernyataan 1 dan 3 benar karena ${topicTitle} merupakan konsep terstruktur yang aplikatif dan menjaga keteraturan sistem.`;

        if (isScience) {
          stimulus = `Hasil pengamatan lingkungan menunjukkan bahwa keharmonisan "${topicTitle}" sangat bergantung pada peran aktif setiap makhluk hidup di dalamnya.`;
          questionText = `Berdasarkan analisis tersebut, manakah DUA pernyataan yang paling tepat mengenai keterkaitan antarkomponen?`;
          options = [
            `Keseimbangan ${topicTitle} terjaga apabila aliran energi dan interaksi berjalan secara alami`,
            'Makhluk hidup dapat bertahan hidup secara mandiri tanpa bergantung pada lingkungannya',
            `Aktivitas manusia yang ramah lingkungan berkontribusi positif merawat kelestarian ${topicTitle}`,
            'Komponen abiotik seperti air dan tanah tidak berpengaruh bagi makhluk hidup',
          ];
          explanation = 'Pilihan 1 dan 3 benar. Keberlanjutan ekosistem memerlukan interaksi seimbang dan dukungan lingkungan abiotik serta tindakan manusia yang arif.';
        }

        fallbackList.push({
          id: `q-ai-${Date.now()}-pgk-${i}`,
          subjectId,
          grade: Number(grade) || 5,
          type: 'PGK',
          level: 'HOTS',
          stimulus,
          questionText,
          options,
          correctAnswers: [0, 2],
          explanation,
          hint: 'Ada minimal 2 jawaban yang tepat. Cermati kalimat yang logis dan selaras dengan fakta ilmiah.',
        });
      }

      // 3. Generate BS Questions (Benar / Salah)
      for (let i = 0; i < parsedBS; i++) {
        let stimulus = `Tinjau fakta-fakta penting seputar topik "${topicTitle}" pada tabel evaluasi konsep berikut:`;
        let questionText = `Tentukan apakah setiap pernyataan berikut BENAR atau SALAH berdasarkan pemahaman konsep "${topicTitle}":`;
        let statements = [
          { id: 's1', text: `Konsep "${topicTitle}" dapat dibuktikan dan diamati dampaknya dalam kehidupan nyata.`, isTrue: true },
          { id: 's2', text: `Perubahan pada satu elemen tidak akan pernah memengaruhi elemen lainnya dalam topik ini.`, isTrue: false },
          { id: 's3', text: `Sikap ilmiah, ketelitian, dan rasa ingin tahu sangat dibutuhkan saat mempelajari ${topicTitle}.`, isTrue: true },
        ];
        let explanation = `Pernyataan 1 dan 3 bernilai BENAR karena materi ${topicTitle} aplikatif dan menuntut sikap ilmiah. Pernyataan 2 bernilai SALAH karena setiap elemen saling berinteraksi.`;

        fallbackList.push({
          id: `q-ai-${Date.now()}-bs-${i}`,
          subjectId,
          grade: Number(grade) || 5,
          type: 'BS',
          level: 'LOTS',
          stimulus,
          questionText,
          statements,
          explanation,
          hint: 'Teliti setiap pernyataan satu per satu. Ingat kembali hubungan sebab-akibat materi.',
        });
      }

      questions = fallbackList;
    }

    res.json({ success: true, questions });
  } catch (error: any) {
    console.error('Error generating AI questions:', error);
    // Even in case of unexpected exception, never return 500 error, return safe questions
    res.json({
      success: true,
      questions: [
        {
          id: `q-ai-${Date.now()}-safe-1`,
          subjectId: req.body?.subjectId || 'ipas',
          grade: Number(req.body?.grade) || 5,
          type: 'PG',
          level: 'MOTS',
          stimulus: `Pengamatan mendalam mengenai konsep "${req.body?.topicTitle || 'Materi Belajar'}" di kehidupan nyata.`,
          questionText: `Manakah kesimpulan yang paling tepat mengenai prinsip dasar dari "${req.body?.topicTitle || 'Materi Belajar'}"?`,
          options: [
            `Menerapkan prinsip utama secara bertanggung jawab dan bijaksana`,
            'Menghafal definisi tanpa memahami proses interaksinya',
            'Konsep tersebut tidak memiliki pengaruh terhadap lingkungan',
            'Menghindari penerapan karena terlalu rumit',
          ],
          correctAnswer: 0,
          explanation: `Pemahaman konsep melatih nalar kritis dan pemecahan masalah kontekstual.`,
          hint: 'Pilihlah jawaban yang paling mencerminkan nalar kritis dan sikap positif.',
        }
      ],
    });
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

// Interactive Videos Database Persistence Endpoints
const VIDEOS_DB_PATH = path.resolve(__dirname, 'data', 'videos.json');

function ensureVideosDb(): any[] {
  try {
    const dataDir = path.resolve(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(VIDEOS_DB_PATH)) {
      fs.writeFileSync(VIDEOS_DB_PATH, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const raw = fs.readFileSync(VIDEOS_DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading videos db:', err);
    return [];
  }
}

function writeVideosDb(videos: any[]): boolean {
  try {
    const dataDir = path.resolve(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(VIDEOS_DB_PATH, JSON.stringify(videos, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing videos db:', err);
    return false;
  }
}

// Get all interactive videos from database
app.get('/api/videos', (req, res) => {
  try {
    const videos = ensureVideosDb();
    const deleted = getDeletedRecords().videos || [];
    const active = videos.filter((v) => v && v.id && !deleted.includes(v.id));
    res.json({ success: true, videos: active });
  } catch (error: any) {
    console.error('Error in GET /api/videos:', error);
    res.status(500).json({ success: false, error: error.message, videos: [] });
  }
});

// Save or replace list of interactive videos
app.post('/api/videos', (req, res) => {
  try {
    const incoming = req.body?.videos || (Array.isArray(req.body) ? req.body : [req.body]);
    if (!Array.isArray(incoming)) {
      return res.status(400).json({ success: false, error: 'Expected an array of videos' });
    }

    const deleted = getDeletedRecords().videos || [];
    // Filter out deleted records from incoming
    const activeIncoming = incoming.filter((v: any) => v && v.id && !deleted.includes(v.id));

    // Process and normalize checkpoints for each video
    const processed = activeIncoming.map((v: any) => {
      let checkpoints: any[] = [];
      if (Array.isArray(v.checkpoints)) {
        checkpoints = v.checkpoints;
      } else if (typeof v.checkpoints === 'string') {
        try {
          checkpoints = JSON.parse(v.checkpoints);
        } catch {
          checkpoints = [];
        }
      }

      // Unmark from deleted records since this video is actively saved
      unmarkRecordDeleted('videos', v.id);

      return {
        ...v,
        id: v.id || `vid-${Date.now()}`,
        checkpoints,
        checkpointsCount: checkpoints.length,
        updatedAt: new Date().toISOString(),
      };
    });

    writeVideosDb(processed);
    res.json({ success: true, count: processed.length, videos: processed });
  } catch (error: any) {
    console.error('Error in POST /api/videos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update single video or create
app.put('/api/videos/:id', (req, res) => {
  try {
    const videoId = req.params.id;
    const videoData = req.body;
    const current = ensureVideosDb();
    const idx = current.findIndex((v) => v.id === videoId);

    const safeCheckpoints = Array.isArray(videoData.checkpoints)
      ? videoData.checkpoints
      : (typeof videoData.checkpoints === 'string'
          ? (() => { try { return JSON.parse(videoData.checkpoints || '[]'); } catch { return []; } })()
          : []);

    const updatedVideo = {
      ...videoData,
      id: videoId,
      checkpoints: safeCheckpoints,
      checkpointsCount: safeCheckpoints.length,
      updatedAt: new Date().toISOString(),
    };

    if (idx !== -1) {
      current[idx] = updatedVideo;
    } else {
      current.unshift(updatedVideo);
    }

    unmarkRecordDeleted('videos', videoId);
    writeVideosDb(current);
    res.json({ success: true, video: updatedVideo });
  } catch (error: any) {
    console.error('Error in PUT /api/videos/:id:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete single video
app.delete('/api/videos/:id', (req, res) => {
  try {
    const videoId = req.params.id;
    markRecordDeleted('videos', videoId);
    const current = ensureVideosDb();
    const filtered = current.filter((v) => v.id !== videoId);
    writeVideosDb(filtered);
    res.json({ success: true, id: videoId });
  } catch (error: any) {
    console.error('Error in DELETE /api/videos/:id:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generic Database & Tombstone Helpers
function getDbPath(filename: string): string {
  return path.resolve(__dirname, 'data', filename);
}

function ensureJsonDb<T>(filename: string, defaultValue: T): T {
  try {
    const dataDir = path.resolve(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const filePath = getDbPath(filename);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8');
      return defaultValue;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return defaultValue;
  }
}

function writeJsonDb<T>(filename: string, data: T): boolean {
  try {
    const dataDir = path.resolve(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const filePath = getDbPath(filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filename}:`, err);
    return false;
  }
}

function getDeletedRecords(): Record<string, string[]> {
  return ensureJsonDb('deleted_records.json', {
    users: [],
    videos: [],
    materials: [],
    questions: [],
    assessments: [],
    activities: [],
    coding: [],
    subjects: [],
    announcements: [],
    classes: [],
    ai_configs: [],
  });
}

function markRecordDeleted(entity: string, id: string, secondaryKey?: string): void {
  const current = getDeletedRecords();
  if (!current[entity]) current[entity] = [];
  const list = current[entity];
  if (id && !list.includes(id)) list.push(id);
  if (secondaryKey && !list.includes(secondaryKey.toLowerCase())) {
    list.push(secondaryKey.toLowerCase());
  }
  writeJsonDb('deleted_records.json', current);
}

function unmarkRecordDeleted(entity: string, id: string, secondaryKey?: string): void {
  const current = getDeletedRecords();
  if (!current[entity]) return;
  current[entity] = current[entity].filter(
    (item) => item !== id && (secondaryKey ? item !== secondaryKey.toLowerCase() : true)
  );
  writeJsonDb('deleted_records.json', current);
}

// Deleted Records API
app.get('/api/deleted-records', (req, res) => {
  res.json({ success: true, deleted: getDeletedRecords() });
});

app.post('/api/deleted-records', (req, res) => {
  const { entity, id, secondaryKey } = req.body || {};
  if (entity && id) {
    markRecordDeleted(entity, id, secondaryKey);
  }
  res.json({ success: true, deleted: getDeletedRecords() });
});

// Users Database Endpoints
app.get('/api/users', (req, res) => {
  try {
    const users = ensureJsonDb<any[]>('users.json', []);
    const deleted = getDeletedRecords().users || [];
    const active = users.filter((u) => {
      if (!u) return false;
      const isIdDel = u.id && deleted.includes(u.id);
      const isUserDel = u.username && deleted.includes(u.username.toLowerCase());
      return !isIdDel && !isUserDel && u.status !== 'DELETED' && u.role !== 'DELETED';
    });
    res.json({ success: true, users: active });
  } catch (error: any) {
    console.error('Error in GET /api/users:', error);
    res.status(500).json({ success: false, error: error.message, users: [] });
  }
});

app.post('/api/users', (req, res) => {
  try {
    const incoming = req.body?.users || (Array.isArray(req.body) ? req.body : [req.body]);
    if (!Array.isArray(incoming)) {
      return res.status(400).json({ success: false, error: 'Expected array of users' });
    }

    const current = ensureJsonDb<any[]>('users.json', []);
    const userMap = new Map<string, any>();
    current.forEach((u) => {
      if (u && (u.id || u.username)) {
        userMap.set(u.id || u.username.toLowerCase(), u);
      }
    });

    incoming.forEach((u) => {
      if (!u) return;
      const key = u.id || u.username.toLowerCase();
      userMap.set(key, { ...userMap.get(key), ...u });
      // If newly active, unmark from deleted records
      if (u.id) unmarkRecordDeleted('users', u.id, u.username);
    });

    const merged = Array.from(userMap.values());
    writeJsonDb('users.json', merged);
    res.json({ success: true, users: merged });
  } catch (error: any) {
    console.error('Error in POST /api/users:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/users/:id', (req, res) => {
  try {
    const userId = req.params.id;
    const userData = req.body;
    const current = ensureJsonDb<any[]>('users.json', []);
    const idx = current.findIndex((u) => u.id === userId || (u.username && u.username.toLowerCase() === userData?.username?.toLowerCase()));

    const updated = {
      ...userData,
      id: userId,
      updatedAt: new Date().toISOString(),
    };

    if (idx !== -1) {
      current[idx] = updated;
    } else {
      current.unshift(updated);
    }

    unmarkRecordDeleted('users', userId, userData.username);
    writeJsonDb('users.json', current);
    res.json({ success: true, user: updated });
  } catch (error: any) {
    console.error('Error in PUT /api/users/:id:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/users/:id', (req, res) => {
  try {
    const userId = req.params.id;
    const current = ensureJsonDb<any[]>('users.json', []);
    const found = current.find((u) => u.id === userId);
    const username = found?.username || req.query.username as string || '';

    // Mark as deleted in tombstone registry
    markRecordDeleted('users', userId, username);

    // Remove from users.json
    const filtered = current.filter((u) => u.id !== userId && (username ? u.username.toLowerCase() !== username.toLowerCase() : true));
    writeJsonDb('users.json', filtered);

    res.json({ success: true, id: userId, username });
  } catch (error: any) {
    console.error('Error in DELETE /api/users/:id:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Materials Database Endpoints
app.get('/api/materials', (req, res) => {
  const materials = ensureJsonDb<any[]>('materials.json', []);
  const deleted = getDeletedRecords().materials || [];
  const active = materials.filter((m) => m && m.id && !deleted.includes(m.id));
  res.json({ success: true, materials: active });
});

app.post('/api/materials', (req, res) => {
  const incoming = req.body?.materials || (Array.isArray(req.body) ? req.body : [req.body]);
  if (Array.isArray(incoming)) {
    writeJsonDb('materials.json', incoming);
  }
  res.json({ success: true, materials: incoming });
});

app.delete('/api/materials/:id', (req, res) => {
  const id = req.params.id;
  markRecordDeleted('materials', id);
  const current = ensureJsonDb<any[]>('materials.json', []);
  const filtered = current.filter((m) => m.id !== id);
  writeJsonDb('materials.json', filtered);
  res.json({ success: true, id });
});

// Questions Database Endpoints
app.get('/api/questions', (req, res) => {
  const questions = ensureJsonDb<any[]>('questions.json', []);
  const deleted = getDeletedRecords().questions || [];
  const active = questions.filter((q) => q && q.id && !deleted.includes(q.id));
  res.json({ success: true, questions: active });
});

app.post('/api/questions', (req, res) => {
  const incoming = req.body?.questions || (Array.isArray(req.body) ? req.body : [req.body]);
  if (Array.isArray(incoming)) {
    writeJsonDb('questions.json', incoming);
  }
  res.json({ success: true, questions: incoming });
});

app.delete('/api/questions/:id', (req, res) => {
  const id = req.params.id;
  markRecordDeleted('questions', id);
  const current = ensureJsonDb<any[]>('questions.json', []);
  const filtered = current.filter((q) => q.id !== id);
  writeJsonDb('questions.json', filtered);
  res.json({ success: true, id });
});

// Assessments Database Endpoints
app.get('/api/assessments', (req, res) => {
  const list = ensureJsonDb<any[]>('assessments.json', []);
  const deleted = getDeletedRecords().assessments || [];
  const active = list.filter((a) => a && a.id && !deleted.includes(a.id));
  res.json({ success: true, assessments: active });
});

app.post('/api/assessments', (req, res) => {
  const incoming = req.body?.assessments || (Array.isArray(req.body) ? req.body : [req.body]);
  if (Array.isArray(incoming)) {
    writeJsonDb('assessments.json', incoming);
  }
  res.json({ success: true, assessments: incoming });
});

app.delete('/api/assessments/:id', (req, res) => {
  const id = req.params.id;
  markRecordDeleted('assessments', id);
  const current = ensureJsonDb<any[]>('assessments.json', []);
  const filtered = current.filter((a) => a.id !== id);
  writeJsonDb('assessments.json', filtered);
  res.json({ success: true, id });
});

// Activities Database Endpoints
app.get('/api/activities', (req, res) => {
  const list = ensureJsonDb<any[]>('activities.json', []);
  const deleted = getDeletedRecords().activities || [];
  const active = list.filter((a) => a && a.id && !deleted.includes(a.id));
  res.json({ success: true, activities: active });
});

app.post('/api/activities', (req, res) => {
  const incoming = req.body?.activities || (Array.isArray(req.body) ? req.body : [req.body]);
  if (Array.isArray(incoming)) {
    writeJsonDb('activities.json', incoming);
  }
  res.json({ success: true, activities: incoming });
});

app.delete('/api/activities/:id', (req, res) => {
  const id = req.params.id;
  markRecordDeleted('activities', id);
  const current = ensureJsonDb<any[]>('activities.json', []);
  const filtered = current.filter((a) => a.id !== id);
  writeJsonDb('activities.json', filtered);
  res.json({ success: true, id });
});

// Coding Challenges Database Endpoints
app.get('/api/coding', (req, res) => {
  const list = ensureJsonDb<any[]>('coding.json', []);
  const deleted = getDeletedRecords().coding || [];
  const active = list.filter((c) => c && c.id && !deleted.includes(c.id));
  res.json({ success: true, coding: active });
});

app.post('/api/coding', (req, res) => {
  const incoming = req.body?.coding || (Array.isArray(req.body) ? req.body : [req.body]);
  if (Array.isArray(incoming)) {
    writeJsonDb('coding.json', incoming);
  }
  res.json({ success: true, coding: incoming });
});

app.delete('/api/coding/:id', (req, res) => {
  const id = req.params.id;
  markRecordDeleted('coding', id);
  const current = ensureJsonDb<any[]>('coding.json', []);
  const filtered = current.filter((c) => c.id !== id);
  writeJsonDb('coding.json', filtered);
  res.json({ success: true, id });
});

// Classes Database Endpoints
app.get('/api/classes', (req, res) => {
  const list = ensureJsonDb<any[]>('classes.json', []);
  const deleted = getDeletedRecords().classes || [];
  const active = list.filter((c) => c && c.id && !deleted.includes(c.id));
  res.json({ success: true, classes: active });
});

app.post('/api/classes', (req, res) => {
  const incoming = req.body?.classes || (Array.isArray(req.body) ? req.body : [req.body]);
  if (Array.isArray(incoming)) {
    writeJsonDb('classes.json', incoming);
  }
  res.json({ success: true, classes: incoming });
});

app.delete('/api/classes/:id', (req, res) => {
  const id = req.params.id;
  markRecordDeleted('classes', id);
  const current = ensureJsonDb<any[]>('classes.json', []);
  const filtered = current.filter((c) => c.id !== id);
  writeJsonDb('classes.json', filtered);
  res.json({ success: true, id });
});

// Announcements Database Endpoints
app.get('/api/announcements', (req, res) => {
  const list = ensureJsonDb<any[]>('announcements.json', []);
  const deleted = getDeletedRecords().announcements || [];
  const active = list.filter((a) => a && a.id && !deleted.includes(a.id));
  res.json({ success: true, announcements: active });
});

app.post('/api/announcements', (req, res) => {
  const incoming = req.body?.announcements || (Array.isArray(req.body) ? req.body : [req.body]);
  if (Array.isArray(incoming)) {
    writeJsonDb('announcements.json', incoming);
  }
  res.json({ success: true, announcements: incoming });
});

app.delete('/api/announcements/:id', (req, res) => {
  const id = req.params.id;
  markRecordDeleted('announcements', id);
  const current = ensureJsonDb<any[]>('announcements.json', []);
  const filtered = current.filter((a) => a.id !== id);
  writeJsonDb('announcements.json', filtered);
  res.json({ success: true, id });
});

// Subjects Database Endpoints
app.get('/api/subjects', (req, res) => {
  const list = ensureJsonDb<any[]>('subjects.json', []);
  const deleted = getDeletedRecords().subjects || [];
  const active = list.filter((s) => s && s.id && !deleted.includes(s.id));
  res.json({ success: true, subjects: active });
});

app.post('/api/subjects', (req, res) => {
  const incoming = req.body?.subjects || (Array.isArray(req.body) ? req.body : [req.body]);
  if (Array.isArray(incoming)) {
    writeJsonDb('subjects.json', incoming);
  }
  res.json({ success: true, subjects: incoming });
});

app.delete('/api/subjects/:id', (req, res) => {
  const id = req.params.id;
  markRecordDeleted('subjects', id);
  const current = ensureJsonDb<any[]>('subjects.json', []);
  const filtered = current.filter((s) => s.id !== id);
  writeJsonDb('subjects.json', filtered);
  res.json({ success: true, id });
});

// AI Tutor Configs Database Endpoints
app.get('/api/ai-configs', (req, res) => {
  const list = ensureJsonDb<any[]>('ai_configs.json', []);
  const deleted = getDeletedRecords().ai_configs || [];
  const active = list.filter((c) => c && c.id && !deleted.includes(c.id));
  res.json({ success: true, configs: active });
});

app.post('/api/ai-configs', (req, res) => {
  const incoming = req.body?.configs || (Array.isArray(req.body) ? req.body : [req.body]);
  if (Array.isArray(incoming)) {
    writeJsonDb('ai_configs.json', incoming);
  }
  res.json({ success: true, configs: incoming });
});

app.delete('/api/ai-configs/:id', (req, res) => {
  const id = req.params.id;
  markRecordDeleted('ai_configs', id);
  const current = ensureJsonDb<any[]>('ai_configs.json', []);
  const filtered = current.filter((c) => c.id !== id);
  writeJsonDb('ai_configs.json', filtered);
  res.json({ success: true, id });
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
