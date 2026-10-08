import type { AssessmentQuestion } from '../types/learning';

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
  studentName?: string;
  studentGrade?: number;
  variationSeed?: string | number;
}

export function getClientDynamicPemantikFallback(params: GeneratePemantikParams): GeneratedPemantik {
  const t = (params.topicTitle || '').toLowerCase();
  const s = (params.subjectName || '').toLowerCase();
  const seed = Date.now();

  if (t.includes('ekosistem') || t.includes('rantai') || t.includes('alam') || s.includes('ipas') || s.includes('sains')) {
    const ecosystems = [
      { name: 'sawah', prod: 'tanaman padi', herb: 'belalang & tikus', carn: 'katak & ular', top: 'burung elang' },
      { name: 'danau air tawar', prod: 'lumut & alga hijau', herb: 'udang kecil & ikan nila', carn: 'ikan gabus', top: 'burung bangau' },
      { name: 'hutan tropis', prod: 'tumbuhan paku & pohon buah', herb: 'rusa & monyet', carn: 'serigala', top: 'harimau sumatera' },
      { name: 'laut pesisir', prod: 'fitoplankton & terumbu karang', herb: 'ikan kecil & kepiting', carn: 'ikan tongkol', top: 'hiu karang' },
      { name: 'kebun sayur sekolah', prod: 'tanaman sawi & tomat', herb: 'ulat daun & siput', carn: 'burung pipit & bunglon', top: 'kucing liar' },
    ];
    const eco = ecosystems[Math.floor(Math.random() * ecosystems.length)];

    const variations = [
      {
        question: `Di sebuah ekosistem ${eco.name}, jika populasi ${eco.top} tiba-tiba diburu hingga punah, menurutmu apa yang akan terjadi pada populasi ${eco.carn} dan ${eco.prod}? Jelaskan alasannya!`,
        clue: `Pikirkan dampak rantai makanan bertingkat: saat pemangsa puncak (${eco.top}) hilang, bagaimana nasib hewan yang biasanya dimangsa?`,
        idealAnswer: `Populasi ${eco.carn} akan bertambah banyak karena tidak ada predator pemangsanya. Hal ini membuat ${eco.herb} diburu berlebihan, dan pada akhirnya keseimbangan ekosistem ${eco.name} menjadi terganggu.`,
        explanation: `Dalam jaring-jaring makanan, hilangnya predator puncak menimbulkan efek domino yang mengacaukan populasi tingkatan di bawahnya.`,
      },
      {
        question: `Bayangkan jika di ekosistem ${eco.name} terjadi kekeringan panjang sehingga ${eco.prod} tidak bisa tumbuh. Bagaimana nasib ${eco.herb} dan ${eco.carn}? Mengapa?`,
        clue: `Ingat bahwa produsen (${eco.prod}) adalah sumber energi utama bagi seluruh makhluk hidup di ekosistem.`,
        idealAnswer: `${eco.herb} akan kekurangan makanan dan populasinya menurun drastis atau mati kelaparan. Selanjutnya, ${eco.carn} juga akan kehilangan mangsa dan populasinya ikut berkurang.`,
        explanation: `Ketiadaan produsen di dasar piramida energi akan memutus aliran energi ke seluruh tingkatan konsumen di atasnya.`,
      },
      {
        question: `Jika manusia menyemprotkan zat kimia pembasmi serangga secara berlebihan di ${eco.name} hingga semua hewan pengurai dan serangga musnah, apa dampak jangka panjangnya pada tanah dan air?`,
        clue: `Pikirkan tugas dekomposer (pengurai) dalam mengolah bangkai dan sisa daun menjadi pupuk alami penyubur tanah.`,
        idealAnswer: `Bangkai dan sampah daun akan menumpuk tanpa membusuk, tanah kehilangan kesuburan alaminya, dan tanaman baru akan sulit tumbuh subur.`,
        explanation: `Pengurai adalah pahlawan tanpa tanda jasa dalam ekosistem yang menjaga siklus daur ulang zat hara tetap berjalan.`,
      },
      {
        question: `Menurut analisismu, mengapa sebuah ekosistem ${eco.name} yang memiliki keanekaragaman makhluk hidup lebih kuat bertahan dari bencana dibandingkan ekosistem yang hanya memiliki 1 jenis hewan saja?`,
        clue: `Pikirkan ketersediaan alternatif makanan jika salah satu spesies hewan terkena penyakit.`,
        idealAnswer: `Karena jika salah satu hewan berkurang, predator masih memiliki pilihan mangsa lain sehingga jaring makanan tidak langsung runtuh total.`,
        explanation: `Semakin beragam makhluk hidup dalam suatu ekosistem, semakin stabil jaring-jaring makanan yang terbentuk.`,
      }
    ];
    const picked = variations[Math.floor(Math.random() * variations.length)];
    return { ...picked, isAiGenerated: false };
  }

  if (t.includes('kpk') || t.includes('fpb') || t.includes('kelipatan') || t.includes('faktor') || s.includes('matematika')) {
    const numA = [4, 6, 8, 12, 15][Math.floor(Math.random() * 5)];
    const numB = [8, 9, 10, 15, 20][Math.floor(Math.random() * 5)];
    const variations = [
      {
        question: `Dua sahabat, Budi dan Siti, berlatih renang di kolam yang sama. Budi berlatih setiap ${numA} hari sekali dan Siti setiap ${numB} hari sekali. Jika hari ini mereka berenang bersama, berapa hari lagi mereka akan bertemu di kolam renang lagi? Bagaimana caramu menghitungnya?`,
        clue: `Gunakan konsep Kelipatan Persekutuan Terkecil (KPK) dari bilangan ${numA} dan ${numB}.`,
        idealAnswer: `Mencari KPK dari ${numA} dan ${numB} untuk menemukan hari pertemuan berikutnya saat jadwal kelipatan keduanya bertemu.`,
        explanation: `KPK digunakan untuk mencari waktu pertemuan bersama dari dua kegiatan yang berulang dengan periode waktu berbeda.`,
      },
      {
        question: `Kakak memiliki 24 kue cokelat dan 36 permen susu yang ingin dimasukkan ke dalam kantong bingkisan ultah. Setiap kantong harus berisi kue dan permen sama banyak tanpa sisa. Berapa kantong paling banyak yang bisa disiapkan? Konsep apa yang digunakan?`,
        clue: `Gunakan konsep Faktor Persekutuan Terbesar (FPB) untuk membagi benda ke dalam kelompok terbesar yang sama rata.`,
        idealAnswer: `Jumlah kantong terbanyak adalah FPB dari 24 dan 36 yaitu 12 kantong, masing-masing berisi 2 kue dan 3 permen.`,
        explanation: `FPB sangat bermanfaat dalam kehidupan sehari-hari untuk membagi barang secara adil tanpa ada bagian yang tersisa.`,
      },
      {
        question: `Lampu hias pohon natal menyala bergantian. Lampu merah menyala tiap ${numA} detik, dan lampu biru menyala tiap ${numB} detik. Pada detik keberapa sajakah kedua lampu akan menyala serentak bersama-sama?`,
        clue: `Tuliskan kelipatan angka ${numA} dan kelipatan angka ${numB}, lalu temukan angka kelipatan persekutuan terkecilnya!`,
        idealAnswer: `Kedua lampu akan menyala bersama pertama kali pada detik kelipatan persekutuan terkecil (KPK) dari ${numA} dan ${numB}.`,
        explanation: `Peristiwa berulang secara berkala akan sinkron pada titik temu kelipatan persekutuan dari kedua interval waktu.`,
      }
    ];
    const picked = variations[Math.floor(Math.random() * variations.length)];
    return { ...picked, isAiGenerated: false };
  }

  const pool = [
    {
      question: params.baseQuestion || `Menurut pengamatanmu dalam kehidupan sehari-hari, bagaimana konsep "${params.topicTitle}" bisa membantu memecahkan masalah di rumah atau lingkungan sekitarmu?`,
      clue: `Hubungkan materi ${params.topicTitle} dengan pengalaman nyata yang sering kamu alami atau lihat.`,
      idealAnswer: `Pemahaman tentang ${params.topicTitle} melatih penalaran kritis dan membantu mengambil keputusan yang bijak dalam kehidupan sehari-hari.`,
      explanation: `Setiap konsep pembelajaran memiliki aplikasi nyata yang bermanfaat untuk melatih daya nalar dan kreativitas siswa.`,
    },
    {
      question: `Bayangkan jika kamu seorang penemu cilik yang sedang merancang karya berbasis "${params.topicTitle}". Hal baru apa yang ingin kamu ciptakan agar bermanfaat bagi teman-teman sekolahmu?`,
      clue: 'Pikirkan solusi kreatif yang mempermudah kegiatan belajar atau membantu lingkungan sekitar.',
      idealAnswer: 'Merancang karya atau kebiasaan baru yang mempermudah pemahaman dan memberikan dampak positif bagi orang lain.',
      explanation: 'Kreativitas berawal dari keberanian menerapkan ilmu pengetahuan untuk menciptakan solusi nyata.',
    }
  ];
  const picked = pool[Math.floor(Math.random() * pool.length)];
  return { ...picked, isAiGenerated: false };
}

export async function generatePemantikQuestion(params: GeneratePemantikParams): Promise<GeneratedPemantik> {
  const dynamicSeed = `${Date.now()}_${Math.random()}`;
  const endpoints = [
    { url: '/api/ai/generate-pemantik', body: { ...params, variationSeed: dynamicSeed } },
    { url: '/.netlify/functions/gemini', body: { action: 'generate-pemantik', ...params, variationSeed: dynamicSeed } },
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

export interface GenerateAssessmentQuestionsParams {
  subjectId?: string;
  topicTitle?: string;
  grade?: number;
  numPG?: number;
  numPGK?: number;
  numBS?: number;
  numMudah?: number;
  numSedang?: number;
  numSulit?: number;
  cognitiveLevel?: string;
  stimulusStyle?: string;
}

export function getClientQuestionsFallback(params: GenerateAssessmentQuestionsParams): AssessmentQuestion[] {
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
  } = params;

  const parsedPG = Math.max(0, Math.min(10, Number(numPG) || 0));
  const parsedPGK = Math.max(0, Math.min(10, Number(numPGK) || 0));
  const parsedBS = Math.max(0, Math.min(10, Number(numBS) || 0));
  const totalCount = parsedPG + parsedPGK + parsedBS;

  const topicLower = (topicTitle || '').toLowerCase();
  const isScience = subjectId === 'ipas' || topicLower.includes('ekosistem') || topicLower.includes('energi') || topicLower.includes('alam');
  const isMath = subjectId === 'matematika' || topicLower.includes('kpk') || topicLower.includes('pecahan');

  const questions: AssessmentQuestion[] = [];

  // PG
  for (let i = 0; i < parsedPG; i++) {
    let level: 'LOTS' | 'MOTS' | 'HOTS' = 'MOTS';
    if (numMudah !== undefined && i < (numMudah || 0)) level = 'LOTS';
    else if (numSulit !== undefined && i >= totalCount - (numSulit || 0)) level = 'HOTS';

    let stimulus = `Dalam pembelajaran materi "${topicTitle}", siswa diajak mengamati hubungan antara konsep teori dengan kejadian nyata di lingkungan sekitar.`;
    let questionText = `Berdasarkan kajian materi "${topicTitle}", manakah kesimpulan yang paling tepat mengenai prinsip dasar yang berlaku?`;
    let options = [
      `Menerapkan prinsip utama ${topicTitle} secara kritis dan solutif dalam kehidupan nyata`,
      'Hanya menghafal definisi tanpa memahami proses interaksinya',
      'Konsep tersebut tidak memiliki pengaruh terhadap keseimbangan lingkungan',
      'Menghindari penerapan karena terlalu rumit untuk dipelajari',
    ];
    let explanation = `Pilihan pertama tepat karena tujuan pembelajaran ${topicTitle} adalah melatih nalar kritis dan pemahaman aplikatif di dunia nyata.`;

    if (isScience) {
      if (i === 0) {
        stimulus = `Sekelompok siswa mengamati ekosistem di lingkungan sekitar. Mereka mendapati hubungan saling ketergantungan antarkomponen dalam topik "${topicTitle}".`;
        questionText = `Apabila salah satu komponen utama dalam rantai materi "${topicTitle}" mengalami kepunahan, dampak apa yang langsung terjadi?`;
        options = [
          'Keseimbangan sistem terganggu dan komponen yang bergantung padanya akan terancam',
          'Semua komponen lain tetap berfungsi seperti biasa tanpa perubahan apa pun',
          'Populasi komponen lain akan meningkat secara tak terbatas tanpa hambatan',
          'Seluruh lingkungan akan membaik karena berkurangnya pemakaian energi',
        ];
        explanation = 'Setiap komponen dalam ekosistem terhubung dalam jaring-jaring kehidupan sehingga hilangnya satu komponen memicu ketidakseimbangan sistem.';
      } else {
        stimulus = `Pada observasi lapangan mengenai topik "${topicTitle}", siswa mencatat bagaimana aliran energi dan materi berlangsung secara berkelanjutan.`;
        questionText = `Peran manusia yang paling bijak untuk mendukung kelestarian konsep "${topicTitle}" adalah...`;
        options = [
          'Menjaga kelestarian habitat dan tidak merusak siklus alam yang sudah terbentuk',
          'Mengambil seluruh sumber daya secara berlebihan untuk kepentingan sesaat',
          'Membiarkan limbah mencemari lingkungan sekitar tempat observasi',
          'Mengganti semua flora dan fauna alami dengan benda tiruan',
        ];
        explanation = 'Sikap peduli dan arif terhadap alam merupakan kunci menjaga keberlanjutan harmoni ekosistem.';
      }
    } else if (isMath) {
      stimulus = `Dalam permasalahan matematika kontekstual seputar "${topicTitle}", peserta didik diajak mencari solusi dari situasi kehidupan sehari-hari.`;
      questionText = `Langkah sistematis mana yang paling tepat untuk menyelesaikan soal cerita pada materi "${topicTitle}"?`;
      options = [
        'Memahami informasi yang diketahui, menyusun model matematika, menyelesaikan, dan memeriksa kembali',
        'Langsung menebak jawaban tanpa membaca soal cerita sampai selesai',
        'Mengabaikan data angka yang tertulis di dalam wacana soal',
        'Menjumlahkan semua angka yang ada tanpa memedulikan perintah soal',
      ];
      explanation = 'Langkah sistematis pemecahan masalah Polya: memahami masalah, membuat rencana, melaksanakan rencana, dan memeriksa kembali.';
    }

    questions.push({
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
      hint: `Perhatikan prinsip utama pembelajaran ${topicTitle}.`,
    });
  }

  // PGK
  for (let i = 0; i < parsedPGK; i++) {
    let stimulus = `Sebuah eksperimen dilakukan untuk menguji efektivitas penerapan konsep "${topicTitle}" pada berbagai kondisi yang berbeda.`;
    let questionText = `Pilihlah DUA atau lebih pernyataan yang BENAR mengenai penerapan konsep "${topicTitle}" berikut: (Pilih lebih dari satu)`;
    let options = [
      `Pemahaman mendalam tentang "${topicTitle}" membantu memecahkan masalah sehari-hari`,
      'Semua variabel dalam eksperimen tidak saling memengaruhi satu sama lain',
      `Penerapan konsep "${topicTitle}" menjaga keseimbangan dan keteraturan sistem`,
      'Hasil pengamatan tidak perlu dicatat secara objektif dan sistematis',
    ];
    let explanation = `Pernyataan 1 dan 3 benar karena ${topicTitle} merupakan konsep terstruktur yang aplikatif dan menjaga keteraturan sistem.`;

    if (isScience) {
      stimulus = `Hasil pengamatan lingkungan menunjukkan bahwa keseimbangan "${topicTitle}" bergantung erat pada keharmonisan komponen hayati dan fisik di sekitarnya.`;
      questionText = `Berdasarkan stimulus di atas, manakah DUA pernyataan yang BENAR mengenai keterkaitan komponen?`;
      options = [
        `Keseimbangan ${topicTitle} terjaga bila interaksi antarkomponen berjalan wajar dan harmonis`,
        'Makhluk hidup dapat bertahan hidup selamanya tanpa membutuhkan udara atau air',
        `Menjaga kebersihan dan kelestarian alam mendukung kelangsungan konsep ${topicTitle}`,
        'Komponen lingkungan tidak memiliki keterkaitan dengan kelangsungan hidup manusia',
      ];
      explanation = 'Opsi A dan C benar. Interaksi timbal balik alami dan kepedulian manusia merawat ekosistem sangat vital.';
    }

    questions.push({
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
      hint: 'Ada minimal 2 jawaban benar. Pilihlah opsi yang sesuai dengan kaidah ilmiah.',
    });
  }

  // BS
  for (let i = 0; i < parsedBS; i++) {
    let stimulus = `Tinjau fakta-fakta penting seputar topik "${topicTitle}" pada tabel evaluasi berikut:`;
    let questionText = `Tentukan apakah setiap pernyataan berikut BENAR atau SALAH berdasarkan konsep "${topicTitle}":`;
    let statements = [
      { id: 's1', text: `Konsep "${topicTitle}" dapat diamati buktinya dalam kehidupan nyata.`, isTrue: true },
      { id: 's2', text: `Perubahan satu komponen tidak memengaruhi komponen lainnya dalam topik ini.`, isTrue: false },
      { id: 's3', text: `Sikap ilmiah dan rasa ingin tahu sangat dibutuhkan saat mempelajari ${topicTitle}.`, isTrue: true },
    ];
    let explanation = `Pernyataan 1 dan 3 benar, sedangkan pernyataan 2 salah karena setiap komponen saling terkait dalam suatu sistem.`;

    questions.push({
      id: `q-ai-${Date.now()}-bs-${i}`,
      subjectId,
      grade: Number(grade) || 5,
      type: 'BS',
      level: 'LOTS',
      stimulus,
      questionText,
      statements,
      explanation,
      hint: 'Pahami kata kuncinya dan tentukan kebenaran dari setiap baris pernyataan.',
    });
  }

  return questions;
}

export async function generateAssessmentQuestions(params: GenerateAssessmentQuestionsParams): Promise<AssessmentQuestion[]> {
  const dynamicSeed = `${Date.now()}_${Math.random()}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  let res: Response;
  try {
    res = await fetch('/api/ai/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...params, variationSeed: dynamicSeed }),
      signal: controller.signal,
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Koneksi generator Gemini AI mengalami batas waktu (timeout). Silakan coba lagi.');
    }
    throw new Error('Gagal menghubungi layanan Gemini AI. Pastikan koneksi internet Anda aktif.');
  }
  clearTimeout(timeoutId);

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Gagal memproses soal dari AI (${res.status}): ${errText || 'Terjadi kesalahan server.'}`);
  }

  const data = await res.json().catch(() => null);
  if (!data || !data.success || !Array.isArray(data.questions) || data.questions.length === 0) {
    throw new Error(data?.error || 'Gemini AI tidak dapat memproses soal untuk topik ini. Silakan coba lagi.');
  }

  return data.questions.map((q: any, idx: number) => {
    const rawType = (q.type || 'PG').toUpperCase();
    const qType = rawType === 'PGK' ? 'PGK' : rawType === 'BS' ? 'BS' : 'PG';
    return {
      id: q.id || `q-ai-${Date.now()}-${idx}`,
      subjectId: q.subjectId || params.subjectId || 'ipas',
      grade: Number(q.grade) || Number(params.grade) || 5,
      type: qType,
      level: q.level || (idx % 3 === 0 ? 'HOTS' : idx % 2 === 0 ? 'MOTS' : 'LOTS'),
      stimulus: q.stimulus || `Stimulus observasi materi ${params.topicTitle || 'Misi Belajar'}.`,
      questionText: q.questionText || q.question || `Pertanyaan pembelajaran seputar ${params.topicTitle || 'materi'}:`,
      options: Array.isArray(q.options) && q.options.length >= 2 ? q.options : ['Opsi A', 'Opsi B', 'Opsi C', 'Opsi D'],
      correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
      correctAnswers: Array.isArray(q.correctAnswers) ? q.correctAnswers : [0, 2],
      statements: Array.isArray(q.statements) && q.statements.length > 0 ? q.statements : [
        { id: 's1', text: `Konsep ${params.topicTitle || 'materi'} terbukti nyata di lingkungan.`, isTrue: true },
        { id: 's2', text: `Komponen sistem ini tidak memiliki keterkaitan sama sekali.`, isTrue: false },
        { id: 's3', text: `Sikap cermat dan ilmiah sangat penting dalam pembelajaran ini.`, isTrue: true }
      ],
      explanation: q.explanation || `Penjelasan pedagogis materi ${params.topicTitle || ''}.`,
      hint: q.hint || `Pikirkan konsep inti pembelajaran ${params.topicTitle || ''}.`,
    };
  });
}
