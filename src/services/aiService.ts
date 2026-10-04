export async function sendAiTutorMessage(message: string, topic: string, subject: string, context?: string): Promise<string> {
  try {
    const res = await fetch('/api/ai/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, topic, subject, context }),
    });
    
    const data = await res.json();
    if (data && data.success && data.reply) {
      return data.reply;
    }
    if (data && data.error) {
      console.warn('API returned error:', data.error);
    }
  } catch (e) {
    console.error('Failed to contact server /api/ai/tutor:', e);
  }

  return `Halo Petualang! Mari kita eksplorasi lebih jauh tentang ${topic}. Apa hal menarik yang ingin kamu tanyakan? 🚀`;
}
