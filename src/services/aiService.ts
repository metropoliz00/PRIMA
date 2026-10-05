function getSmartFallbackReply(message: string, topic: string, subject: string): string {
  const msg = (message || '').toLowerCase();
  const t = topic || 'Ekosistem & Lingkungan';
  
  if (msg.includes('rantai') || msg.includes('makanan') || msg.includes('produsen') || msg.includes('konsumen') || msg.includes('hewan') || msg.includes('tumbuhan')) {
    return `Hebat sekali rasa ingin tahumu tentang ${t}! 🌟 Dalam rantai makanan, tumbuhan berperan sebagai produsen karena bisa menghasilkan makanan sendiri lewat bantuan cahaya matahari. Menurutmu, hewan apa yang menjadi konsumen tingkat pertama setelah tumbuhan? ✨`;
  }
  if (msg.includes('ekosistem') || msg.includes('harmoni') || msg.includes('lingkungan') || msg.includes('alam')) {
    return `Pertanyaan yang luar biasa kritis! 💡 Setiap makhluk hidup di ${t} saling bergantung satu sama lain dalam suatu harmoni alam. Jika salah satu komponen terganggu, apa dampaknya bagi kelangsungan hidup yang lain? 🚀`;
  }
  if (msg.includes('energi') || msg.includes('matahari') || msg.includes('cahaya')) {
    return `Energi matahari adalah sumber kehidupan utama di bumi! ☀️ Tumbuhan menyerapnya untuk berfotosintesis. Coba tebak, ke mana aliran energi tersebut berpindah setelah tumbuhan dimakan oleh hewan herbivora? 🌾`;
  }
  if (msg.includes('dekomposer') || msg.includes('pengurai') || msg.includes('jamur') || msg.includes('bakteri')) {
    return `Peran dekomposer sangat luar biasa penting! 🍄 Jamur dan bakteri menguraikan sisa makhluk hidup menjadi zat hara penyubur tanah. Tanpa dekomposer, apa yang akan terjadi pada lingkungan sekitar kita? 🌿`;
  }
  return `Pertanyaan yang sangat cerdas seputar ${t}! 🌟 Mari kita ingat kembali petunjuk materi tadi. Menurut pengamatanmu, apa peran penting makhluk hidup tersebut dalam menjaga keseimbangan alam? 💡`;
}

export async function sendAiTutorMessage(message: string, topic: string, subject: string, context?: string): Promise<string> {
  const endpoints = ['/.netlify/functions/gemini', '/api/ai/tutor'];
  
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, topic, subject, context }),
      });
      
      if (res.ok) {
        const resData = await res.json();
        if (resData && resData.reply) {
          return resData.reply;
        }
      }
    } catch (e) {
      // Try next endpoint
    }
  }

  return getSmartFallbackReply(message, topic, subject);
}

export interface PemantikEvaluationResult {
  score: number;
  isCorrect: boolean;
  statusLabel: string;
  feedback: string;
  strengths: string;
  suggestion: string;
  idealAnswer: string;
  explanation: string;
}

export interface EvaluatePemantikParams {
  question: string;
  studentAnswer: string;
  topicTitle?: string;
  subjectName?: string;
  referenceExplanation?: string;
  referenceCorrectAnswer?: string;
}

export function getSmartPemantikEvaluationFallback(params: EvaluatePemantikParams): PemantikEvaluationResult {
  const {
    question = '',
    studentAnswer = '',
    topicTitle = 'Misi Belajar',
    subjectName = 'IPAS',
    referenceExplanation = '',
    referenceCorrectAnswer = '',
  } = params;

  const ans = (studentAnswer || '').trim().toLowerCase();
  const q = (question || '').toLowerCase();
  const topic = (topicTitle || '').toLowerCase();

  const isEcosystem = topic.includes('ekosistem') || q.includes('rumput') || q.includes('belalang') || q.includes('rantai') || q.includes('produsen');
  const isMathKpk = topic.includes('kpk') || topic.includes('fpb') || q.includes('ronda') || q.includes('hari lagi') || q.includes('kelipatan');

  let score = 78;
  let strengths = 'Kamu sudah berani menyampaikan pendapat logis dengan kata-katamu sendiri.';
  let suggestion = 'Hubungkan lebih dalam dengan konsep utama pembelajaran.';
  let feedback = '';
  let idealAnswer = referenceCorrectAnswer || referenceExplanation;

  if (isEcosystem) {
    idealAnswer = idealAnswer || 'Jika rumput hilang, belalang kehilangan sumber makanan utama sehingga populasinya akan berkurang drastis atau mati kelaparan. Burung pemakan belalang juga akan kesulitan mencari makan, sehingga seluruh rantai makanan menjadi terganggu.';
    
    const hitFood = ans.includes('makan') || ans.includes('kelaparan') || ans.includes('lapar') || ans.includes('habis');
    const hitDecrease = ans.includes('mati') || ans.includes('berkurang') || ans.includes('sedikit') || ans.includes('hilang') || ans.includes('musnah') || ans.includes('punah');
    const hitBird = ans.includes('burung') || ans.includes('predator') || ans.includes('pemangsa') || ans.includes('rantai');
    const hitProducer = ans.includes('produsen') || ans.includes('tumbuhan') || ans.includes('rumput');

    const hitsCount = [hitFood, hitDecrease, hitBird, hitProducer].filter(Boolean).length;

    if (hitsCount >= 3) {
      score = 95;
      strengths = 'Analisis hubungan sebab-akibat sangat lengkap! Kamu memahami dampak hilangnya produsen hingga ke konsumen berikutnya.';
      suggestion = 'Pertahankan cara berpikir komprehensif ini untuk langkah eksplorasi konsep berikutnya!';
      feedback = `Luar biasa cerdas! 🌟 Jawabanmu "${studentAnswer}" sangat tepat. Kamu berhasil menguraikan bahwa rumput adalah sumber makanan vital, dan ketiadaannya akan memicu penurunan populasi belalang sekaligus mengacaukan kelangsungan hidup burung pemakannya.`;
    } else if (hitsCount >= 2) {
      score = 88;
      strengths = 'Kamu sudah tepat mengidentifikasi dampak langsung pada kelangsungan hidup belalang.';
      suggestion = 'Akan lebih sempurna jika kamu juga mengulas nasib burung pemakan belalang dalam rantai makanan.';
      feedback = `Bagus sekali! 💡 Pemikiranmu tentang "${studentAnswer}" tepat sasaran. Belalang memang akan sangat kesulitan karena rumput adalah makanan pokoknya.`;
    } else if (hitsCount === 1) {
      score = 78;
      strengths = 'Ide dasarmu sudah benar dan relevan dengan topik rantai makanan.';
      suggestion = 'Perjelas apa yang terjadi pada populasi belalang jika tidak ada makanan sama sekali.';
      feedback = `Ide yang bagus! 🌿 Kamu sudah mulai menangkap konsep penting bahwa setiap makhluk hidup saling bergantung untuk makan dan bertahan hidup.`;
    } else if (ans.length > 5) {
      score = 68;
      strengths = 'Keberanianmu menuangkan pemikiran awal sangat kami apresiasi.';
      suggestion = 'Coba bayangkan: apa makanan belalang? Jika makanannya hilang, apa yang terjadi?';
      feedback = `Terima kasih sudah mencoba menjawab! 🚀 Jawabanmu adalah langkah awal yang baik. Mari kita lihat konsep rantai makanan secara lengkap di bawah ini.`;
    } else {
      score = 55;
      strengths = 'Sudah bersedia menuliskan jawaban singkat.';
      suggestion = 'Cobalah menuliskan kalimat yang lebih lengkap dan jelas.';
      feedback = `Ayo terus asah rasa ingin tahumu! Simak penjelasan lengkap konsep ekosistem berikut ini ya. ✨`;
    }
  } else if (isMathKpk) {
    idealAnswer = idealAnswer || 'Mereka akan ronda bersama lagi pada 12 hari yang akan datang, karena 12 adalah Kelipatan Persekutuan Terkecil (KPK) dari 4 dan 6.';
    
    if (ans.includes('12')) {
      score = 95;
      strengths = 'Perhitungan atau temuan angkamu sangat akurat (12 hari)!';
      suggestion = 'Sangat bagus! Ingat bahwa ini diperoleh dari kelipatan persekutuan terkecil (KPK).';
      feedback = `Hebat sekali! 🌟 Jawabanmu "${studentAnswer}" benar tepat 12 hari lagi. Kelipatan 4 adalah 4, 8, 12... dan kelipatan 6 adalah 6, 12, 18... Keduanya bertemu pertama kali di angka 12!`;
    } else if (ans.includes('kpk') || ans.includes('kelipatan') || ans.includes('bagi')) {
      score = 80;
      strengths = 'Pendekatan konsepmu sudah benar menggunakan kelipatan persekutuan.';
      suggestion = 'Coba hitung kelipatan 4 dan 6 yang sama dan paling kecil.';
      feedback = `Bagus! 💡 Kamu sudah tahu bahwa persoalan jadwal ronda bersama berkaitan erat dengan konsep KPK.`;
    } else {
      score = 68;
      strengths = 'Kamu sudah berusaha menghitung dan bernalar.';
      suggestion = 'Gunakan kelipatan bilangan 4 dan 6 untuk menemukan hari pertemuan mereka.';
      feedback = `Usaha yang baik! 🚀 Mari kita pelajari cara mudah mencari KPK pada tahap Eksplorasi Materi berikutnya.`;
    }
  } else {
    idealAnswer = idealAnswer || 'Jawaban yang selaras dengan tujuan pembelajaran pada topik ini.';
    const isGoodLength = ans.length >= 15;
    score = isGoodLength ? 85 : 72;
    strengths = 'Keberanianmu bernalar kritis dan menuliskan jawaban dengan mandiri.';
    suggestion = 'Kaitkan dengan pengalaman nyata atau konsep inti topik ini.';
    feedback = `Jawaban yang menarik! 💡 Pemikiranmu menunjukkan rasa ingin tahu yang tinggi mengenai ${topicTitle}. Terus tingkatkan kemampuan berpikir kritismu!`;
  }

  const statusLabel =
    score >= 85
      ? 'Luar Biasa & Sangat Tepat! 🌟'
      : score >= 70
      ? 'Bagus & Mendekati Benar! 💡'
      : 'Ide Bagus, Ayo Pelajari Lebih Lanjut! 🚀';

  return {
    score,
    isCorrect: score >= 65,
    statusLabel,
    feedback,
    strengths,
    suggestion,
    idealAnswer,
    explanation: referenceExplanation || idealAnswer,
  };
}

export async function evaluatePemantikAnswer(params: EvaluatePemantikParams): Promise<PemantikEvaluationResult> {
  const endpoints = [
    { url: '/api/ai/evaluate-pemantik', body: params },
    { url: '/.netlify/functions/gemini', body: { action: 'evaluate-pemantik', ...params } },
  ];

  for (const { url, body } of endpoints) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.score === 'number' && data.feedback) {
          return {
            score: data.score,
            isCorrect: Boolean(data.isCorrect),
            statusLabel: data.statusLabel || (data.score >= 80 ? 'Luar Biasa & Sangat Tepat! 🌟' : 'Bagus & Mendekati Benar! 💡'),
            feedback: data.feedback,
            strengths: data.strengths || 'Penalaran logis yang baik dan berani berpendapat.',
            suggestion: data.suggestion || 'Terus perdalam pemahaman di tahap eksplorasi.',
            idealAnswer: data.idealAnswer || params.referenceCorrectAnswer || params.referenceExplanation || '',
            explanation: data.explanation || params.referenceExplanation || data.idealAnswer || '',
          };
        }
      }
    } catch {
      // Continue to next endpoint or fallback
    }
  }

  return getSmartPemantikEvaluationFallback(params);
}

export interface GeneratedPemantik {
  question: string;
  clue: string;
  idealAnswer: string;
  explanation: string;
  isAiGenerated: boolean;
}

export interface GeneratePemantikParams {
  topicTitle: string;
  subjectName?: string;
  baseQuestion?: string;
  learningObjectives?: string;
}

export function getClientDynamicPemantikFallback(params: GeneratePemantikParams): GeneratedPemantik {
  const t = (params.topicTitle || '').toLowerCase();
  const s = (params.subjectName || '').toLowerCase();

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
    const picked = pool[Math.floor(Math.random() * pool.length)];
    return { ...picked, isAiGenerated: false };
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
    const picked = pool[Math.floor(Math.random() * pool.length)];
    return { ...picked, isAiGenerated: false };
  }

  const pool = [
    {
      question: params.baseQuestion || `Menurut pengamatanmu dalam kehidupan sehari-hari, mengapa kita perlu mempelajari materi "${params.topicTitle}"? Apa masalah di sekitarmu yang bisa diselesaikan dengan pemahaman ini?`,
      clue: `Hubungkan konsep ${params.topicTitle} dengan pengalaman nyata yang sering kamu lihat di rumah atau sekolah.`,
      idealAnswer: `Pemahaman tentang ${params.topicTitle} melatih penalaran kritis dan membantu kita memahami cara kerja lingkungan sekitar dengan bijak.`,
      explanation: `Konsep ini dirancang untuk menjawab fenomena dunia nyata dan melatih kita berpikir kritis serta mandiri.`,
    },
    {
      question: `Bayangkan jika kamu seorang detektif sains yang sedang mengamati "${params.topicTitle}". Jika ada satu bagian yang hilang atau berubah drastis, apa dampak pertama yang akan kamu cari tahu? Mengapa?`,
      clue: 'Fokus pada hubungan sebab dan akibat antara bagian-bagian dalam topik ini.',
      idealAnswer: 'Mencari tahu bagian mana yang paling terdampak secara langsung, lalu memprediksi dampaknya ke hal-hal lain di sekitarnya.',
      explanation: 'Berpikir ilmiah berarti menelusuri rantai sebab-akibat dari setiap perubahan fenomena.',
    }
  ];
  const picked = pool[Math.floor(Math.random() * pool.length)];
  return { ...picked, isAiGenerated: false };
}

export async function generatePemantikQuestion(params: GeneratePemantikParams): Promise<GeneratedPemantik> {
  const endpoints = [
    { url: '/api/ai/generate-pemantik', body: { ...params, variationSeed: Math.random() } },
    { url: '/.netlify/functions/gemini', body: { action: 'generate-pemantik', ...params, variationSeed: Math.random() } },
  ];

  for (const { url, body } of endpoints) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.question) {
          return {
            question: data.question,
            clue: data.clue || 'Pikirkan hubungan sebab-akibat dari konsep materi ini.',
            idealAnswer: data.idealAnswer || '',
            explanation: data.explanation || '',
            isAiGenerated: Boolean(data.isAiGenerated ?? true),
          };
        }
      }
    } catch {
      // Continue to next endpoint or fallback
    }
  }

  return getClientDynamicPemantikFallback(params);
}
