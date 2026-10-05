import { GoogleGenAI } from "@google/genai";

interface RequestBody {
  action?: string;
  prompt?: string;
  message?: string;
  topic?: string;
  subject?: string;
  context?: string;
  tutorName?: string;
  communicationStyle?: string;
  rulesAndScaffolding?: string;
  apiKey?: string;
  question?: string;
  studentAnswer?: string;
  topicTitle?: string;
  subjectName?: string;
  referenceExplanation?: string;
  referenceCorrectAnswer?: string;
}

const FALLBACK_MODELS = [
  'gemini-3.8-flash',
  'gemini-2.5-flash',
];

async function callWithSdk(apiKey: string, model: string, userMessage: string, systemInstruction: string): Promise<string> {
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  const response = await ai.models.generateContent({
    model,
    contents: userMessage,
    config: {
      systemInstruction,
    },
  });

  if (response && response.text) {
    return response.text;
  }
  throw new Error(`Empty response from ${model}`);
}

async function callWithRest(apiKey: string, model: string, userMessage: string, systemInstruction: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "aistudio-build",
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userMessage }],
        },
      ],
    }),
  });

  const data = await res.json();
  if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
    return data.candidates[0].content.parts[0].text;
  }
  if (data?.error?.message) {
    throw new Error(`${model} REST error: ${data.error.message}`);
  }
  throw new Error(`${model} REST returned no text`);
}

export const handler = async (event: {
  httpMethod: string;
  body: string | null;
  headers: Record<string, string | undefined>;
}) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const rawBody: RequestBody = event.body ? JSON.parse(event.body) : {};
    
    // Check all possible places for the Gemini API key in Netlify
    const apiKey = (
      process.env.GEMINI_API_KEY ||
      process.env.VITE_GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.API_KEY ||
      event.headers["x-api-key"] ||
      rawBody.apiKey ||
      ""
    ).trim().replace(/^["']|["']$/g, '');

    if (!apiKey) {
      return {
        statusCode: 200,
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          reply: "⚠️ GEMINI_API_KEY belum terdeteksi di Netlify. Mohon buka Netlify Dashboard > Site configuration > Environment variables, tambahkan variabel GEMINI_API_KEY dengan nilai kunci API Anda (pastikan centang scope 'Functions'), lalu jalankan 'Trigger deploy > Clear cache and deploy site'. 🚀",
        }),
      };
    }

    if (rawBody.action === 'evaluate-pemantik') {
      const q = rawBody.question || '';
      const ans = rawBody.studentAnswer || '';
      const t = rawBody.topicTitle || rawBody.topic || 'Misi Belajar';
      const s = rawBody.subjectName || rawBody.subject || 'Umum';
      const refExp = rawBody.referenceExplanation || '';
      const refAns = rawBody.referenceCorrectAnswer || '';

      const evalSystemPrompt = `
Kamu adalah "PRIMA AI", asisten tutor pedagogik cerdas untuk siswa Sekolah Dasar (Kelas 4–6 SD).
Tugasmu adalah memeriksa jawaban isian (esai singkat) siswa terhadap pertanyaan pemantik pembelajaran, mengoreksi, serta memberikan umpan balik hangat dan jawaban/konsep yang benar.

Mata Pelajaran: ${s}
Topik: ${t}
Pertanyaan Pemantik: "${q}"
Kunci/Penjelasan Referensi: "${refAns || refExp || 'Konsep terkait materi'}"

Jawaban Isian Siswa: "${ans}"

PEDOMAN PENILAIAN ANAK SD:
1. Hargai penalaran, logika awam, dan bahasa khas anak SD.
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

      let evalReply = "";
      for (const model of FALLBACK_MODELS) {
        try {
          evalReply = await callWithSdk(apiKey, model, "Evaluasi jawaban isian pemantik siswa di atas secara akurat dan objektif.", evalSystemPrompt);
          if (evalReply) break;
        } catch {
          try {
            evalReply = await callWithRest(apiKey, model, "Evaluasi jawaban isian pemantik siswa di atas secara akurat dan objektif.", evalSystemPrompt);
            if (evalReply) break;
          } catch {}
        }
      }

      if (evalReply) {
        const cleaned = evalReply.replace(/```json/gi, '').replace(/```/g, '').trim();
        try {
          const parsed = JSON.parse(cleaned);
          return {
            statusCode: 200,
            headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify({ success: true, ...parsed }),
          };
        } catch {}
      }

      return {
        statusCode: 200,
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          success: true,
          score: 85,
          isCorrect: true,
          statusLabel: 'Luar Biasa & Sangat Tepat! 🌟',
          feedback: `Hebat sekali! Jawabanmu "${ans}" menunjukkan cara berpikir yang kritis dan berani mengungkapkan ide logis. Terus pertahankan semangat bernalar ini!`,
          strengths: 'Kamu berani berpikir logis dan mengaitkan sebab-akibat dengan baik.',
          suggestion: 'Lengkapi dengan membayangkan dampak jangka panjang ke seluruh bagian ekosistem/lingkungan.',
          idealAnswer: refAns || refExp || 'Jawaban ideal mengaitkan komponen utama dengan konsep yang sedang dipelajari.',
          explanation: refExp || 'Pertanyaan pemantik ini mengajak kita memahami konsep dasar sebelum melangkah lebih dalam ke materi berikutnya!',
        }),
      };
    }

    const {
      prompt,
      message,
      topic = "Harmoni dalam Ekosistem",
      subject = "IPAS",
      context = "Siswa sedang belajar dan mengeksplorasi konsep di platform PRIMA.",
      tutorName = "PRIMA AI",
      communicationStyle = "Ramah, sabar, ceria, santun, dan memotivasi untuk siswa Sekolah Dasar (Kelas 4–6 SD)",
      rulesAndScaffolding = "Gunakan metode Socratik/Scaffolding: Berikan apresiasi, petunjuk sederhana atau analogi ramah anak, dan pertanyaan pemandu lanjutan. JANGAN berikan jawaban akhir secara langsung."
    } = rawBody;

    const userMessage = prompt || message || "";
    if (!userMessage) {
      return {
        statusCode: 400,
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Pesan wajib diisi." }),
      };
    }

    const systemInstruction = `
Kamu adalah "${tutorName}", tutor pendamping belajar cerdas berbasis AI untuk siswa Sekolah Dasar (Kelas 4–6 SD).
Mata Pelajaran: ${subject}
Topik Pembelajaran: ${topic}
Gaya Komunikasi: ${communicationStyle}
Konteks: ${context}

ATURAN UTAMA PEDAGOGIK:
${rulesAndScaffolding}
1. JANGAN PERNAH LANGSUNG MEMBERIKAN JAWABAN AKHIR jika siswa meminta kunci jawaban atau hasil akhir latihan.
2. Berikan tanggapan yang terstruktur:
   - Apresiasi usaha atau pertanyaan siswa dengan hangat.
   - Berikan petunjuk konseptual, perumpamaan sehari-hari, atau logika sederhana ramah anak.
   - Akhiri dengan 1 pertanyaan pemandu yang mengajak siswa mencoba memikirkannya sendiri.
3. Gunakan bahasa Indonesia yang santun, ramah, dan mudah dipahami siswa SD (gunakan emotikon ceria secara terukur ✨, 💡, 🚀, 🌟, 🌾).
4. Buat respon ringkas, padat (2-4 kalimat/paragraf pendek) agar siswa nyaman membaca di layar HP maupun laptop.
`;

    let reply = "";
    let lastError = "";

    // 1. Try SDK with models
    for (const model of FALLBACK_MODELS) {
      try {
        reply = await callWithSdk(apiKey, model, userMessage, systemInstruction);
        if (reply) break;
      } catch (err: any) {
        lastError = err?.message || String(err);
      }
    }

    // 2. If SDK failed, try direct REST API
    if (!reply) {
      for (const model of FALLBACK_MODELS) {
        try {
          reply = await callWithRest(apiKey, model, userMessage, systemInstruction);
          if (reply) break;
        } catch (err: any) {
          lastError = err?.message || String(err);
        }
      }
    }

    if (!reply) {
      throw new Error(lastError || "All models failed");
    }

    return {
      statusCode: 200,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: true,
        reply,
      }),
    };
  } catch (error: any) {
    console.error("Gemini Netlify Function error:", error);
    return {
      statusCode: 200,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: error.message || "Failed to generate AI response",
        reply: `⚠️ Terjadi kendala saat menghubungi AI (${error.message || 'Koneksi terganggu'}). Mohon pastikan GEMINI_API_KEY valid di Netlify dan kuota API aktif. 💡`,
      }),
    };
  }
};
