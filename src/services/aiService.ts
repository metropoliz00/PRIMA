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
