import { GoogleGenAI } from '@google/genai';

const SYSTEM_INSTRUCTION = `Kamu adalah CepatRetur, asisten customer service khusus penukaran dan pengembalian barang.

Tugas:
- Menjelaskan prosedur retur dengan bahasa sederhana.
- Membantu pengguna memahami panduan pengemasan.
- Menjelaskan status retur berdasarkan data konteks yang diberikan sistem.
- Memberikan rekomendasi berupa refund, penukaran ukuran, penggantian barang, atau bantuan customer service.
- Mempertahankan konteks percakapan.

Batasan:
- Jawab hanya dalam Bahasa Indonesia.
- Bersikap ramah, profesional, sabar, dan ringkas.
- Jangan mengubah keputusan kelayakan dari sistem.
- Jangan membuat nomor pesanan, kode retur, alamat, status, atau kebijakan.
- Jangan menganggap data simulasi sebagai informasi toko nyata.
- Jangan menjanjikan refund sebelum pengajuan disetujui.
- Jangan meminta kata sandi, PIN, OTP, CVV, atau nomor kartu.
- Jika informasi tidak tersedia, katakan bahwa data belum tersedia.`;

export async function generateChatResponse(conversation, context = {}) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key') {
    return {
      error: true,
      statusCode: 500,
      message: 'GEMINI_API_KEY belum dikonfigurasi di server. Silakan tambahkan API key di file .env.'
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  // Format conversation array into Gemini SDK contents structure
  const contents = conversation.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  // Build system instruction with optional context metadata
  let enrichedSystemInstruction = SYSTEM_INSTRUCTION;
  if (context && Object.keys(context).length > 0) {
    const contextLines = [];
    if (context.orderNumber) contextLines.push(`Nomor Pesanan: ${context.orderNumber}`);
    if (context.returnCode) contextLines.push(`Kode Retur: ${context.returnCode}`);
    if (context.eligibilityResult) {
      contextLines.push(`Status Kelayakan Sistem: ${JSON.stringify(context.eligibilityResult)}`);
    }
    if (contextLines.length > 0) {
      enrichedSystemInstruction += `\n\n[Data Konteks Sistem]\n${contextLines.join('\n')}`;
    }
  }

  // Model list to ensure high availability across API key tiers
  const candidateModels = ['gemini-2.5-flash', 'gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-2.0-flash'];
  let lastError = null;

  for (const modelName of candidateModels) {
    try {
      // 15 seconds timeout to prevent hanging UI
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('REQUEST_TIMEOUT')), 15000)
      );

      const apiCallPromise = ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          temperature: 0.3,
          topP: 0.8,
          topK: 20,
          systemInstruction: enrichedSystemInstruction
        }
      });

      const response = await Promise.race([apiCallPromise, timeoutPromise]);

      if (response && response.text) {
        return {
          error: false,
          result: response.text,
          model: 'gemini-2.5-flash'
        };
      }
    } catch (err) {
      lastError = err;
      if (err.message === 'REQUEST_TIMEOUT') {
        return {
          error: true,
          statusCode: 504,
          message: 'Permintaan ke layanan AI membutuhkan waktu terlalu lama. Silakan coba lagi.'
        };
      }
      // If 404 (model deprecated for key) or 429, try next model in candidate list
    }
  }

  // Handle specific user-friendly error messages
  const errMessage = lastError?.message || '';
  if (errMessage.includes('quota') || errMessage.includes('RESOURCE_EXHAUSTED') || errMessage.includes('429')) {
    return {
      error: true,
      statusCode: 429,
      message: 'Layanan AI sedang mencapai batas penggunaan kuota (Rate Limit). Silakan coba lagi dalam beberapa saat.'
    };
  }

  if (errMessage.includes('API key') || errMessage.includes('API_KEY_INVALID') || errMessage.includes('400')) {
    return {
      error: true,
      statusCode: 401,
      message: 'Konfigurasi GEMINI_API_KEY tidak valid. Silakan periksa kembali API Key pada file .env server.'
    };
  }

  return {
    error: true,
    statusCode: 500,
    message: 'Maaf, terjadi kendala saat menghubungi layanan AI. Silakan coba lagi beberapa saat lagi.'
  };
}
