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
  apiKey?: string;
}

const FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-3.8-flash',
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
