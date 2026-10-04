import { GoogleGenAI } from "@google/genai";

interface RequestBody {
  prompt?: string;
  message?: string;
  topic?: string;
  subject?: string;
  context?: string;
  tutorName?: string;
  communicationStyle?: string;
  rulesAndScaffolding?: string;
}

export const handler = async (event: {
  httpMethod: string;
  body: string | null;
  headers: Record<string, string | undefined>;
}) => {
  // CORS Headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
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
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "GEMINI_API_KEY is not configured in Netlify environment variables.",
          reply: "Kunci API (GEMINI_API_KEY) belum dikonfigurasi di dashboard Netlify. Silakan atur di Site settings > Environment variables.",
        }),
      };
    }

    const body: RequestBody = event.body ? JSON.parse(event.body) : {};
    const {
      prompt,
      message,
      topic = "Misi Belajar",
      subject = "Umum",
      context = "Siswa sedang belajar.",
      tutorName = "PRIMA AI",
      communicationStyle = "Ramah, sabar, ceria, santun, dan memotivasi untuk siswa Sekolah Dasar (Kelas 4–6 SD)",
      rulesAndScaffolding = "Gunakan metode Socratik/Scaffolding: Berikan apresiasi, petunjuk sederhana atau analogi ramah anak, dan pertanyaan pemandu lanjutan. JANGAN berikan jawaban akhir secara langsung."
    } = body;

    const userMessage = prompt || message || "";
    if (!userMessage) {
      return {
        statusCode: 400,
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Pesan (prompt atau message) wajib diisi." }),
      };
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const systemInstruction = `
Kamu adalah "${tutorName}", tutor pendamping belajar cerdas berbasis AI untuk siswa Sekolah Dasar (Kelas 4–6 SD).
Mata Pelajaran: ${subject}
Topik Pembelajaran: ${topic}
Gaya Komunikasi: ${communicationStyle}
Konteks: ${context}

ATURAN PEDAGOGIK:
${rulesAndScaffolding}
- JANGAN berikan jawaban tugas/asesmen akhir secara langsung.
- Berikan apresiasi, penjelasan/analogi ramah anak, dan 1 pertanyaan pemandu lanjutan.
- Gunakan bahasa Indonesia santun dan emotikon ceria (✨, 💡, 🚀).
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: userMessage,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || "Mari kita telaah bersama konsep ini! Apa yang sudah kamu amati? 💡";

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
      statusCode: 500,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: error.message || "Failed to call Gemini API",
        reply: "Terjadi sedikit kendala saat menghubungi tutor AI. Mari coba tanyakan kembali ya! 💡",
      }),
    };
  }
};
