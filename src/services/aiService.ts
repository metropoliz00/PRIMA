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
  try {
    const res = await fetch('/api/ai/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, topic, subject, context }),
    });
    
    const resData = await res.json();
    if (resData && resData.success && resData.reply) {
      return resData.reply;
    }
  } catch (e) {
    // Ignore server route error on static hosting
  }

  return getSmartFallbackReply(message, topic, subject);
}
