import express from 'express';
import type { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function callGemini(promptText: string): Promise<string> {
  const models = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
  for (const model of models) {
    try {
      if (GEMINI_API_KEY) {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 7000)
        );
        const response = await Promise.race([
          ai.models.generateContent({
            model,
            contents: promptText,
          }),
          timeoutPromise,
        ]);
        if (response && response.text) {
          return response.text;
        }
      }

      // REST fallback
      if (GEMINI_API_KEY) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
        const timeoutController = new AbortController();
        const timer = setTimeout(() => timeoutController.abort(), 7000);
        const response = await fetch(url, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'User-Agent': 'aistudio-build'
          },
          signal: timeoutController.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }]
          })
        });
        clearTimeout(timer);
        const data = await response.json();
        if (data && data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
          return data.candidates[0].content.parts[0].text;
        }
      }
    } catch (err) {
      console.warn(`Model ${model} fetch exception:`, err);
    }
  }
  return '';
}

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

app.post('/api/ai/tutor', async (req: Request, res: Response) => {
  try {
    const { message, topic, subject, context, tutorName, communicationStyle, rulesAndScaffolding } = req.body || {};
    const botName = tutorName || 'PRIMA AI';
    const style = communicationStyle || 'Ramah, sabar, ceria, santun, dan memotivasi untuk siswa Sekolah Dasar (Kelas 4–6 SD)';
    const customRules = rulesAndScaffolding || 'Gunakan metode Socratik/Scaffolding: Berikan apresiasi, petunjuk sederhana atau analogi ramah anak, dan pertanyaan pemandu lanjutan. JANGAN berikan jawaban akhir secara langsung.';

    const systemInstruction = `
Kamu adalah "${botName}", tutor pendamping belajar cerdas berbasis AI untuk siswa Sekolah Dasar (Kelas 4–6 SD).
Mata Pelajaran: ${subject || 'Umum'}
Topik Pembelajaran: ${topic || 'Misi Belajar'}
Gaya Komunikasi: ${style}
Konteks: ${context || 'Siswa sedang belajar.'}
ATURAN PEDAGOGIK:
${customRules}
JANGAN berikan jawaban akhir secara langsung. Berikan apresiasi, petunjuk atau analogi, dan pertanyaan pemandu. Gunakan bahasa Indonesia santun dan emotikon ceria (✨, 💡, 🚀).
`;
    const fullPrompt = `${systemInstruction}\n\nSiswa bertanya: "${message}"`;
    const reply = await callGemini(fullPrompt);
    res.json({ success: true, reply });
  } catch (error: any) {
    console.error('API /api/ai/tutor error:', error);
    res.status(500).json({ success: false, error: error.message || 'Gemini API failed' });
  }
});

app.post('/api/ai/reflection', async (req: Request, res: Response) => {
  try {
    const { reflectionText, topic, subject } = req.body || {};
    const prompt = `Kamu adalah PRIMA AI, evaluator refleksi siswa SD. Topik: ${topic} (${subject}). Berikan apresiasi hangat (2-3 kalimat) atas refleksi: "${reflectionText}"`;
    const feedback = await callGemini(prompt);
    res.json({ success: true, feedback });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/ai/teacher-consultant', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body || {};
    const prompt = `Kamu adalah PRIMA Teacher AI Assistant untuk guru SD. Pertanyaan guru: "${message}"`;
    const reply = await callGemini(prompt);
    res.json({ success: true, reply });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/ai/generate-questions', async (req: Request, res: Response) => {
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
    } = req.body || {};

    const parsedPG = Math.max(0, Math.min(10, Number(numPG) || 0));
    const parsedPGK = Math.max(0, Math.min(10, Number(numPGK) || 0));
    const parsedBS = Math.max(0, Math.min(10, Number(numBS) || 0));
    const totalRequested = parsedPG + parsedPGK + parsedBS;

    if (totalRequested === 0) {
      return res.json({ success: true, questions: [] });
    }

    const systemPrompt = `
Kamu adalah pakar pembuat soal Asesmen Kurikulum Merdeka tingkat SD (Kelas 4-6 SD).
Topik: "${topicTitle}" (Mapel: "${subjectId}", Kelas: ${grade} SD).
Buat ${parsedPG} soal PG (4 opsi, 1 benar), ${parsedPGK} soal PGK (4 opsi, minimal 2 benar), ${parsedBS} soal BS (3 pernyataan).
Output format: JSON array murni tanpa markdown.
Struktur item: { id, subjectId, grade, type ("PG"|"PGK"|"BS"), level ("LOTS"|"MOTS"|"HOTS"), stimulus, questionText, options, correctAnswer, correctAnswers, statements, explanation, hint }
`;

    let questions: any[] = [];
    if (GEMINI_API_KEY) {
      try {
        const replyText = await callGemini(systemPrompt);
        const parsed = extractJsonArray(replyText);
        if (Array.isArray(parsed) && parsed.length > 0) {
          questions = parsed;
        }
      } catch (e) {
        console.warn('api/index.ts generate-questions error:', e);
      }
    }

    if (questions.length === 0) {
      for (let i = 0; i < parsedPG; i++) {
        questions.push({
          id: `q-ai-${Date.now()}-pg-${i}`,
          subjectId,
          grade: Number(grade) || 5,
          type: 'PG',
          level: 'MOTS',
          stimulus: `Pengamatan mendalam mengenai konsep "${topicTitle}" di lingkungan sekitar.`,
          questionText: `Berdasarkan pembelajaran "${topicTitle}", manakah kesimpulan yang paling tepat mengenai prinsip dasar yang berlaku?`,
          options: [
            `Menerapkan prinsip utama ${topicTitle} secara bijak dan solutif di kehidupan nyata`,
            'Hanya menghafal istilah tanpa memahami hubungan sebab-akibat',
            'Prinsip ini sama sekali tidak memiliki dampak terhadap kehidupan sekitar',
            'Mengabaikan keterkaitan konsep karena dianggap tidak berpengaruh',
          ],
          correctAnswer: 0,
          explanation: `Pemahaman tentang ${topicTitle} melatih nalar kritis dan pemecahan masalah kontekstual.`,
          hint: `Pikirkan kata kunci utama dari materi ${topicTitle}.`,
        });
      }
      for (let i = 0; i < parsedPGK; i++) {
        questions.push({
          id: `q-ai-${Date.now()}-pgk-${i}`,
          subjectId,
          grade: Number(grade) || 5,
          type: 'PGK',
          level: 'HOTS',
          stimulus: `Analisis penerapan konsep "${topicTitle}" dalam kehidupan nyata.`,
          questionText: `Pilihlah DUA atau lebih pernyataan yang BENAR mengenai konsep "${topicTitle}" berikut:`,
          options: [
            `Pemahaman mendalam tentang "${topicTitle}" melatih penalaran kritis`,
            'Komponen dalam materi ini tidak saling memengaruhi',
            `Penerapan konsep "${topicTitle}" menjaga keseimbangan sistem`,
            'Hasil pengamatan tidak perlu dicatat secara objektif',
          ],
          correctAnswers: [0, 2],
          explanation: `Pernyataan 1 dan 3 benar karena ${topicTitle} menjaga keteraturan sistem.`,
          hint: 'Pilihlah minimal 2 opsi yang benar dan ilmiah.',
        });
      }
      for (let i = 0; i < parsedBS; i++) {
        questions.push({
          id: `q-ai-${Date.now()}-bs-${i}`,
          subjectId,
          grade: Number(grade) || 5,
          type: 'BS',
          level: 'LOTS',
          stimulus: `Tinjau pernyataan seputar konsep "${topicTitle}":`,
          questionText: `Tentukan apakah setiap pernyataan berikut BENAR atau SALAH:`,
          statements: [
            { id: 's1', text: `Konsep "${topicTitle}" dapat diterapkan di kehidupan nyata.`, isTrue: true },
            { id: 's2', text: `Perubahan satu komponen tidak memengaruhi komponen lainnya.`, isTrue: false },
            { id: 's3', text: `Sikap ilmiah sangat dibutuhkan saat mempelajari ${topicTitle}.`, isTrue: true },
          ],
          explanation: `Pernyataan 1 dan 3 benar, pernyataan 2 salah.`,
          hint: 'Ingat kembali hubungan sebab-akibat antarkomponen.',
        });
      }
    }

    res.json({ success: true, questions });
  } catch (error: any) {
    res.json({ success: true, questions: [] });
  }
});

let inMemoryVideos: any[] = [];
let inMemoryUsers: any[] = [];
let inMemoryMaterials: any[] = [];
let inMemoryQuestions: any[] = [];
let inMemoryAssessments: any[] = [];
let inMemoryActivities: any[] = [];
let inMemoryCoding: any[] = [];
let inMemoryClasses: any[] = [];
let inMemoryAnnouncements: any[] = [];
let inMemorySubjects: any[] = [];
let inMemoryAiConfigs: any[] = [];
let inMemoryDeletedRecords: Record<string, string[]> = {
  users: [],
  videos: [],
  materials: [],
  questions: [],
  assessments: [],
  activities: [],
  coding: [],
  classes: [],
  announcements: [],
  subjects: [],
  ai_configs: [],
};

// Deleted records
app.get('/api/deleted-records', (req: Request, res: Response) => {
  res.json({ success: true, deleted: inMemoryDeletedRecords });
});

app.post('/api/deleted-records', (req: Request, res: Response) => {
  const { entity, id, secondaryKey } = req.body || {};
  if (entity && id) {
    if (!inMemoryDeletedRecords[entity]) inMemoryDeletedRecords[entity] = [];
    if (!inMemoryDeletedRecords[entity].includes(id)) inMemoryDeletedRecords[entity].push(id);
    if (secondaryKey && !inMemoryDeletedRecords[entity].includes(secondaryKey.toLowerCase())) {
      inMemoryDeletedRecords[entity].push(secondaryKey.toLowerCase());
    }
  }
  res.json({ success: true, deleted: inMemoryDeletedRecords });
});

// Videos
app.get('/api/videos', (req: Request, res: Response) => {
  res.json({ success: true, videos: inMemoryVideos });
});

app.post('/api/videos', (req: Request, res: Response) => {
  try {
    const incoming = req.body?.videos || (Array.isArray(req.body) ? req.body : [req.body]);
    if (Array.isArray(incoming)) inMemoryVideos = incoming;
    res.json({ success: true, videos: inMemoryVideos });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.delete('/api/videos/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  inMemoryVideos = inMemoryVideos.filter((v) => v.id !== id);
  if (!inMemoryDeletedRecords.videos.includes(id)) inMemoryDeletedRecords.videos.push(id);
  res.json({ success: true, id });
});

// Users
app.get('/api/users', (req: Request, res: Response) => {
  const deleted = inMemoryDeletedRecords.users || [];
  const active = inMemoryUsers.filter((u) => u && !deleted.includes(u.id) && !deleted.includes(u.username?.toLowerCase()));
  res.json({ success: true, users: active });
});

app.post('/api/users', (req: Request, res: Response) => {
  const incoming = req.body?.users || (Array.isArray(req.body) ? req.body : [req.body]);
  if (Array.isArray(incoming)) {
    inMemoryUsers = incoming;
  }
  res.json({ success: true, users: inMemoryUsers });
});

app.delete('/api/users/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const username = req.query.username as string || '';
  inMemoryUsers = inMemoryUsers.filter((u) => u.id !== id && (username ? u.username?.toLowerCase() !== username.toLowerCase() : true));
  if (!inMemoryDeletedRecords.users.includes(id)) inMemoryDeletedRecords.users.push(id);
  if (username && !inMemoryDeletedRecords.users.includes(username.toLowerCase())) inMemoryDeletedRecords.users.push(username.toLowerCase());
  res.json({ success: true, id, username });
});

// Materials
app.get('/api/materials', (req: Request, res: Response) => {
  res.json({ success: true, materials: inMemoryMaterials });
});
app.post('/api/materials', (req: Request, res: Response) => {
  const incoming = req.body?.materials || (Array.isArray(req.body) ? req.body : [req.body]);
  if (Array.isArray(incoming)) inMemoryMaterials = incoming;
  res.json({ success: true, materials: inMemoryMaterials });
});
app.delete('/api/materials/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  inMemoryMaterials = inMemoryMaterials.filter((m) => m.id !== id);
  if (!inMemoryDeletedRecords.materials.includes(id)) inMemoryDeletedRecords.materials.push(id);
  res.json({ success: true, id });
});

// Questions
app.get('/api/questions', (req: Request, res: Response) => {
  res.json({ success: true, questions: inMemoryQuestions });
});
app.post('/api/questions', (req: Request, res: Response) => {
  const incoming = req.body?.questions || (Array.isArray(req.body) ? req.body : [req.body]);
  if (Array.isArray(incoming)) inMemoryQuestions = incoming;
  res.json({ success: true, questions: inMemoryQuestions });
});
app.delete('/api/questions/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  inMemoryQuestions = inMemoryQuestions.filter((q) => q.id !== id);
  if (!inMemoryDeletedRecords.questions.includes(id)) inMemoryDeletedRecords.questions.push(id);
  res.json({ success: true, id });
});

// Assessments
app.get('/api/assessments', (req: Request, res: Response) => {
  res.json({ success: true, assessments: inMemoryAssessments });
});
app.post('/api/assessments', (req: Request, res: Response) => {
  const incoming = req.body?.assessments || (Array.isArray(req.body) ? req.body : [req.body]);
  if (Array.isArray(incoming)) inMemoryAssessments = incoming;
  res.json({ success: true, assessments: inMemoryAssessments });
});
app.delete('/api/assessments/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  inMemoryAssessments = inMemoryAssessments.filter((a) => a.id !== id);
  if (!inMemoryDeletedRecords.assessments.includes(id)) inMemoryDeletedRecords.assessments.push(id);
  res.json({ success: true, id });
});

// Activities
app.get('/api/activities', (req: Request, res: Response) => {
  res.json({ success: true, activities: inMemoryActivities });
});
app.post('/api/activities', (req: Request, res: Response) => {
  const incoming = req.body?.activities || (Array.isArray(req.body) ? req.body : [req.body]);
  if (Array.isArray(incoming)) inMemoryActivities = incoming;
  res.json({ success: true, activities: inMemoryActivities });
});
app.delete('/api/activities/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  inMemoryActivities = inMemoryActivities.filter((a) => a.id !== id);
  if (!inMemoryDeletedRecords.activities.includes(id)) inMemoryDeletedRecords.activities.push(id);
  res.json({ success: true, id });
});

// Coding
app.get('/api/coding', (req: Request, res: Response) => {
  res.json({ success: true, coding: inMemoryCoding });
});
app.post('/api/coding', (req: Request, res: Response) => {
  const incoming = req.body?.coding || (Array.isArray(req.body) ? req.body : [req.body]);
  if (Array.isArray(incoming)) inMemoryCoding = incoming;
  res.json({ success: true, coding: inMemoryCoding });
});
app.delete('/api/coding/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  inMemoryCoding = inMemoryCoding.filter((c) => c.id !== id);
  if (!inMemoryDeletedRecords.coding.includes(id)) inMemoryDeletedRecords.coding.push(id);
  res.json({ success: true, id });
});

// Classes
app.get('/api/classes', (req: Request, res: Response) => {
  res.json({ success: true, classes: inMemoryClasses });
});
app.post('/api/classes', (req: Request, res: Response) => {
  const incoming = req.body?.classes || (Array.isArray(req.body) ? req.body : [req.body]);
  if (Array.isArray(incoming)) inMemoryClasses = incoming;
  res.json({ success: true, classes: inMemoryClasses });
});
app.delete('/api/classes/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  inMemoryClasses = inMemoryClasses.filter((c) => c.id !== id);
  if (!inMemoryDeletedRecords.classes.includes(id)) inMemoryDeletedRecords.classes.push(id);
  res.json({ success: true, id });
});

// Announcements
app.get('/api/announcements', (req: Request, res: Response) => {
  res.json({ success: true, announcements: inMemoryAnnouncements });
});
app.post('/api/announcements', (req: Request, res: Response) => {
  const incoming = req.body?.announcements || (Array.isArray(req.body) ? req.body : [req.body]);
  if (Array.isArray(incoming)) inMemoryAnnouncements = incoming;
  res.json({ success: true, announcements: inMemoryAnnouncements });
});
app.delete('/api/announcements/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  inMemoryAnnouncements = inMemoryAnnouncements.filter((a) => a.id !== id);
  if (!inMemoryDeletedRecords.announcements.includes(id)) inMemoryDeletedRecords.announcements.push(id);
  res.json({ success: true, id });
});

// Subjects
app.get('/api/subjects', (req: Request, res: Response) => {
  res.json({ success: true, subjects: inMemorySubjects });
});
app.post('/api/subjects', (req: Request, res: Response) => {
  const incoming = req.body?.subjects || (Array.isArray(req.body) ? req.body : [req.body]);
  if (Array.isArray(incoming)) inMemorySubjects = incoming;
  res.json({ success: true, subjects: inMemorySubjects });
});
app.delete('/api/subjects/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  inMemorySubjects = inMemorySubjects.filter((s) => s.id !== id);
  if (!inMemoryDeletedRecords.subjects.includes(id)) inMemoryDeletedRecords.subjects.push(id);
  res.json({ success: true, id });
});

// AI Configs
app.get('/api/ai-configs', (req: Request, res: Response) => {
  res.json({ success: true, configs: inMemoryAiConfigs });
});
app.post('/api/ai-configs', (req: Request, res: Response) => {
  const incoming = req.body?.configs || (Array.isArray(req.body) ? req.body : [req.body]);
  if (Array.isArray(incoming)) inMemoryAiConfigs = incoming;
  res.json({ success: true, configs: inMemoryAiConfigs });
});
app.delete('/api/ai-configs/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  inMemoryAiConfigs = inMemoryAiConfigs.filter((c) => c.id !== id);
  if (!inMemoryDeletedRecords.ai_configs.includes(id)) inMemoryDeletedRecords.ai_configs.push(id);
  res.json({ success: true, id });
});

export default app;
