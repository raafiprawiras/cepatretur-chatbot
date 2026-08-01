export function validateChatPayload(body) {
  if (!body || typeof body !== 'object') {
    return { valid: false, message: 'Body request harus berupa JSON object.' };
  }

  const { conversation, context } = body;

  if (!Array.isArray(conversation)) {
    return { valid: false, message: 'Properti "conversation" harus berupa array.' };
  }

  if (conversation.length === 0) {
    return { valid: false, message: 'Properti "conversation" tidak boleh kosong.' };
  }

  if (conversation.length > 30) {
    return { valid: false, message: 'Jumlah pesan dalam conversation melebihi batas maksimal 30 pesan.' };
  }

  const sanitizedConversation = [];

  for (let i = 0; i < conversation.length; i++) {
    const item = conversation[i];
    if (!item || typeof item !== 'object') {
      return { valid: false, message: `Pesan pada indeks ${i} bukan merupakan object yang valid.` };
    }

    const { role, text } = item;

    if (role !== 'user' && role !== 'model') {
      return { valid: false, message: `Role pada pesan indeks ${i} harus berupa "user" atau "model".` };
    }

    if (typeof text !== 'string' || text.trim().length === 0) {
      return { valid: false, message: `Teks pada pesan indeks ${i} wajib diisi dan berupa string non-kosong.` };
    }

    if (text.length > 2000) {
      return { valid: false, message: `Teks pada pesan indeks ${i} melebihi batas maksimal 2000 karakter.` };
    }

    sanitizedConversation.push({
      role,
      text: text.trim()
    });
  }

  // Sanitize optional context
  let sanitizedContext = {};
  if (context && typeof context === 'object') {
    sanitizedContext = {
      orderNumber: typeof context.orderNumber === 'string' ? context.orderNumber.substring(0, 50) : null,
      returnCode: typeof context.returnCode === 'string' ? context.returnCode.substring(0, 50) : null,
      eligibilityResult: context.eligibilityResult || null
    };
  }

  return {
    valid: true,
    data: {
      conversation: sanitizedConversation,
      context: sanitizedContext
    }
  };
}
