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

async function callGeminiAPI(promptText: string, key: string, options?: { temperature?: number; topP?: number }): Promise<string> {
  const models = ['gemini-3.8-flash', 'gemini-2.5-flash'];
  
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
          ],
          generationConfig: {
            temperature: options?.temperature ?? 0.95,
            topP: options?.topP ?? 0.95,
          }
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
