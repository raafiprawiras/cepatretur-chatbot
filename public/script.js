// CepatRetur — Client Script with Session Storage & Custom Profile Avatars
document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');
  const resetBtn = document.getElementById('reset-btn');
  const chatMessages = document.getElementById('chat-messages');
  const typingIndicator = document.getElementById('typing-indicator');
  const errorBanner = document.getElementById('error-banner');
  const errorMessage = document.getElementById('error-message');
  const closeErrorBtn = document.getElementById('close-error-btn');

  // Header Status Elements
  const apiHealthPill = document.getElementById('api-health-pill');
  const apiHealthText = document.getElementById('api-health-text');

  // Quick Action Buttons
  const btnAjukan = document.getElementById('btn-ajukan-retur');
  const btnLacak = document.getElementById('btn-lacak-status');
  const btnKebijakan = document.getElementById('btn-tanya-kebijakan');
  const btnMenuUtama = document.getElementById('btn-menu-utama');

  // Storage Keys
  const SESSION_CHAT_KEY = 'cepatretur_chat_session';
  const SESSION_ID_KEY = 'cepatretur_chat_session_id';
  const WIZARD_KEY = 'cepatretur_wizard_state';
  const RETURNS_KEY = 'cepatretur_returns_data'; // Preserved in localStorage

  const LEGACY_CHAT_KEYS = [
    'chatHistory',
    'conversation',
    'cepatretur_chat',
    'cepatretur_conversation',
    'cepatretur_chat_history'
  ];

  const TRACKING_STAGES = [
    'Pengajuan dibuat',
    'Menunggu pengiriman pelanggan',
    'Paket dikirim',
    'Paket diterima pusat retur',
    'Barang sedang diperiksa',
    'Retur disetujui',
    'Refund atau barang pengganti diproses',
    'Retur selesai'
  ];

  let conversationHistory = [];
  let isProcessing = false;

  // App State Machine
  let wizardState = {
    step: 'IDLE', // IDLE | ASK_ORDER | ASK_SEAL | ASK_DAYS | ASK_REASON | RESULT | ASK_RESOLUTION | ASK_CATEGORY | COMPLETED | ASK_TRACKING_CODE
    data: {
      orderNumber: null,
      sealAvailable: null,
      daysRange: null,
      reason: null,
      resolution: null,
      category: null
    },
    result: null,
    createdReturn: null
  };

  // 1. Initial health check & Periodic check
  checkApiHealth();
  setInterval(checkApiHealth, 30000);

  // 2. Clean legacy localStorage chat keys & Initialize Session
  cleanLegacyChatKeys();
  getOrCreateSessionId();
  loadChatHistory();
  loadWizardState();

  function getOrCreateSessionId() {
    try {
      let sid = sessionStorage.getItem(SESSION_ID_KEY);
      if (!sid) {
        sid = (typeof crypto !== 'undefined' && crypto.randomUUID)
          ? crypto.randomUUID()
          : 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        sessionStorage.setItem(SESSION_ID_KEY, sid);
      }
      return sid;
    } catch (e) {
      return 'session_fallback';
    }
  }

  function cleanLegacyChatKeys() {
    try {
      LEGACY_CHAT_KEYS.forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (e) {
      console.warn('Gagal membersihkan legacy chat keys:', e);
    }
  }

  async function checkApiHealth() {
    try {
      const res = await fetch('/api/health', { method: 'GET', headers: { 'Accept': 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'ok') {
          if (apiHealthPill) {
            apiHealthPill.className = 'status-pill online';
            if (apiHealthText) apiHealthText.textContent = 'API Terhubung';
          }
          return;
        }
      }
      setOfflineState();
    } catch (e) {
      setOfflineState();
    }
  }

  function setOfflineState() {
    if (apiHealthPill) {
      apiHealthPill.className = 'status-pill offline';
      if (apiHealthText) apiHealthText.textContent = 'API Terputus';
    }
  }

  function loadChatHistory() {
    try {
      const savedSession = sessionStorage.getItem(SESSION_CHAT_KEY);
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed && Array.isArray(parsed.conversation) && parsed.conversation.length > 0) {
          chatMessages.innerHTML = '';
          conversationHistory = parsed.conversation;
          parsed.conversation.forEach((msg) => {
            const sender = msg.role === 'user' ? 'user' : 'bot';
            appendMessageUI(sender, msg.text, false);
          });
          scrollToBottom();
          return;
        }
      }
    } catch (e) {
      console.warn('Gagal membaca chat dari sessionStorage, memulai sesi baru:', e);
      try {
        sessionStorage.removeItem(SESSION_CHAT_KEY);
      } catch (err) {}
    }
    initChat();
  }

  function saveHistory() {
    try {
      const sessionData = {
        conversation: conversationHistory,
        messages: conversationHistory,
        startedAt: new Date().toISOString()
      };
      sessionStorage.setItem(SESSION_CHAT_KEY, JSON.stringify(sessionData));
    } catch (e) {
      console.warn('Gagal menyimpan chat ke sessionStorage:', e);
    }
  }

  function loadWizardState() {
    try {
      const savedWizard = sessionStorage.getItem(WIZARD_KEY);
      if (savedWizard) {
        const parsed = JSON.parse(savedWizard);
        if (parsed && parsed.step && parsed.step !== 'IDLE') {
          wizardState = parsed;
        }
      }
    } catch (e) {
      console.warn('Gagal membaca state wizard:', e);
    }
  }

  function saveWizardState() {
    try {
      sessionStorage.setItem(WIZARD_KEY, JSON.stringify(wizardState));
    } catch (e) {
      console.warn('Gagal menyimpan state wizard:', e);
    }
  }

  function resetWizardState() {
    wizardState = {
      step: 'IDLE',
      data: { orderNumber: null, sealAvailable: null, daysRange: null, reason: null, resolution: null, category: null },
      result: null,
      createdReturn: null
    };
    try {
      sessionStorage.removeItem(WIZARD_KEY);
    } catch (e) {}
    userInput.placeholder = 'Tulis kendala barang Anda...';
  }

  function getReturnsFromStorage() {
    try {
      const data = localStorage.getItem(RETURNS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Gagal membaca list retur dari localStorage:', e);
    }
    return [];
  }

  function saveReturnToLocalStorage(returnData) {
    try {
      let returnsList = getReturnsFromStorage();
      const fullReturnObject = {
        returnCode: returnData.returnCode,
        orderNumber: returnData.orderNumber,
        answers: { ...wizardState.data },
        eligibilityResult: wizardState.result,
        resolution: returnData.resolution,
        category: returnData.category,
        packingInstructions: returnData.packingInstructions,
        shippingAddress: returnData.shippingAddress,
        status: returnData.status || 'Pengajuan dibuat',
        statusHistory: [
          { status: returnData.status || 'Pengajuan dibuat', timestamp: returnData.createdAt }
        ],
        createdAt: returnData.createdAt,
        updatedAt: returnData.createdAt
      };

      returnsList.push(fullReturnObject);
      localStorage.setItem(RETURNS_KEY, JSON.stringify(returnsList));
    } catch (e) {
      console.warn('Gagal menyimpan data retur ke localStorage:', e);
    }
  }

  function updateReturnInLocalStorage(updatedReturn) {
    try {
      let returnsList = getReturnsFromStorage();
      const index = returnsList.findIndex(r => r.returnCode === updatedReturn.returnCode);
      if (index !== -1) {
        returnsList[index] = updatedReturn;
        localStorage.setItem(RETURNS_KEY, JSON.stringify(returnsList));
      }
    } catch (e) {
      console.warn('Gagal memperbarui data retur di localStorage:', e);
    }
  }

  function showToast(message) {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = `ℹ️ ${message}`;
    document.body.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 3000);
  }

  function initChat() {
    chatMessages.innerHTML = '';
    conversationHistory = [];
    try {
      sessionStorage.removeItem(SESSION_CHAT_KEY);
      sessionStorage.removeItem(WIZARD_KEY);
    } catch (e) {}
    resetWizardState();
    hideError();

    const welcomeMsg = 'Halo! Saya CepatRetur, asisten penukaran dan pengembalian barang. Apa yang dapat saya bantu hari ini?';
    appendMessageUI('bot', welcomeMsg, false);
  }

  function resetChatSessionOnly() {
    try {
      sessionStorage.removeItem(SESSION_CHAT_KEY);
      sessionStorage.removeItem(SESSION_ID_KEY);
      sessionStorage.removeItem(WIZARD_KEY);
      showToast('Sesi percakapan telah dibersihkan.');
    } catch (e) {}
    initChat();
  }

  function formatCurrentTime(dateObj = new Date()) {
    const now = typeof dateObj === 'string' ? new Date(dateObj) : dateObj;
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  function formatFullDateTime(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function showTyping(customText) {
    const typingTextEl = typingIndicator.querySelector('.typing-text');
    if (typingTextEl) {
      typingTextEl.textContent = customText || 'CepatRetur sedang memeriksa...';
    }
    typingIndicator.classList.remove('hidden');
    scrollToBottom();
  }

  function hideTyping() {
    typingIndicator.classList.add('hidden');
  }

  function setProcessingState(processing) {
    isProcessing = processing;
    sendBtn.disabled = processing;
    userInput.disabled = processing;
    resetBtn.disabled = processing;
    if (btnAjukan) btnAjukan.disabled = processing;
    if (btnLacak) btnLacak.disabled = processing;
    if (btnKebijakan) btnKebijakan.disabled = processing;
    if (btnMenuUtama) btnMenuUtama.disabled = processing;
  }

  function showError(msg) {
    errorMessage.textContent = msg || 'Terjadi kesalahan pada server. Silakan coba lagi.';
    errorBanner.classList.remove('hidden');
  }

  function hideError() {
    errorBanner.classList.add('hidden');
  }

  // Safe Avatar Creation Helper
  function createAvatar(sender) {
    const avatar = document.createElement('div');
    avatar.className = `message-avatar ${sender === 'user' ? 'user-avatar' : 'bot-avatar'}`;
    avatar.setAttribute('aria-label', sender === 'user' ? 'Pengguna' : 'CepatRetur Bot');

    if (sender === 'user') {
      avatar.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
    } else {
      const botImg = document.createElement('img');
      botImg.src = '/images/Logo-CepatRetur.png';
      botImg.alt = 'CepatRetur';
      botImg.setAttribute('aria-hidden', 'true');
      avatar.appendChild(botImg);
    }
    return avatar;
  }

  // Safe Message Meta Helper (Author & Time)
  function createMessageMeta(sender, timestampStr) {
    const meta = document.createElement('div');
    meta.className = `message-meta ${sender === 'user' ? 'user-meta' : ''}`;

    const author = document.createElement('span');
    author.className = `message-author ${sender === 'user' ? 'user-author' : ''}`;
    author.textContent = sender === 'user' ? 'Anda' : 'CepatRetur AI';

    const time = document.createElement('time');
    time.className = 'message-time';
    time.textContent = timestampStr || formatCurrentTime();

    meta.appendChild(author);
    meta.appendChild(time);
    return meta;
  }

  // Safe DOM message creation
  function appendMessageUI(sender, text, shouldScroll = true) {
    const row = document.createElement('div');
    row.className = `message-row ${sender}`;

    const avatar = createAvatar(sender);
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const meta = createMessageMeta(sender);
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text;

    contentDiv.appendChild(meta);
    contentDiv.appendChild(bubble);

    row.appendChild(avatar);
    row.appendChild(contentDiv);

    chatMessages.appendChild(row);
    if (shouldScroll) {
      scrollToBottom();
    }
    return row;
  }

  // Safe DOM card creation for Wizard
  function appendWizardCardUI(title, description, options, onSelect) {
    const row = document.createElement('div');
    row.className = 'message-row bot';

    const avatar = createAvatar('bot');
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const meta = createMessageMeta('bot');
    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    const wizardCard = document.createElement('div');
    wizardCard.className = 'wizard-card';

    const titleEl = document.createElement('div');
    titleEl.className = 'wizard-title';
    titleEl.textContent = title;
    wizardCard.appendChild(titleEl);

    if (description) {
      const descEl = document.createElement('p');
      descEl.textContent = description;
      wizardCard.appendChild(descEl);
    }

    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'wizard-options';

    const optionButtons = [];

    options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'wizard-option-btn';
      btn.textContent = opt.label;
      btn.addEventListener('click', () => {
        optionButtons.forEach(b => b.disabled = true);
        btn.classList.add('selected');
        onSelect(opt);
      });
      optionButtons.push(btn);
      optionsContainer.appendChild(btn);
    });

    wizardCard.appendChild(optionsContainer);

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'wizard-cancel-btn';
    cancelBtn.textContent = '✖ Batalkan & Kembali ke Menu Utama';
    cancelBtn.addEventListener('click', () => {
      optionButtons.forEach(b => b.disabled = true);
      resetWizardState();
      appendMessageUI('bot', 'Proses dibatalkan. Kembali ke menu utama.');
    });
    wizardCard.appendChild(cancelBtn);

    bubble.appendChild(wizardCard);
    contentDiv.appendChild(meta);
    contentDiv.appendChild(bubble);

    row.appendChild(avatar);
    row.appendChild(contentDiv);

    chatMessages.appendChild(row);
    scrollToBottom();
  }

  // Render Result Card (Milestone 5)
  function renderResultCardUI(resultData, shouldScroll = true) {
    const row = document.createElement('div');
    row.className = 'message-row bot';

    const avatar = createAvatar('bot');
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const meta = createMessageMeta('bot');
    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    const card = document.createElement('div');
    card.className = 'result-card';

    const badge = document.createElement('div');
    if (resultData.eligible && !resultData.reviewRequired) {
      badge.className = 'result-badge eligible';
      badge.textContent = '✅ LAYAK RETUR';
    } else if (resultData.eligible && resultData.reviewRequired) {
      badge.className = 'result-badge review';
      badge.textContent = '🟡 MEMERLUKAN INSPEKSI BUKTI FOTO/VIDEO';
    } else {
      badge.className = 'result-badge rejected';
      badge.textContent = '❌ TIDAK LAYAK RETUR';
    }
    card.appendChild(badge);

    const reasonP = document.createElement('p');
    reasonP.textContent = resultData.reason;
    card.appendChild(reasonP);

    if (Array.isArray(resultData.requirements) && resultData.requirements.length > 0) {
      const reqDiv = document.createElement('div');
      reqDiv.className = 'result-requirements';
      const reqTitle = document.createElement('h4');
      reqTitle.textContent = 'Persyaratan Pengajuan:';
      reqDiv.appendChild(reqTitle);

      const ul = document.createElement('ul');
      resultData.requirements.forEach(req => {
        const li = document.createElement('li');
        li.textContent = req;
        ul.appendChild(li);
      });
      reqDiv.appendChild(ul);
      card.appendChild(reqDiv);
    }

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'wizard-actions';

    if (resultData.eligible) {
      const btnLanjut = document.createElement('button');
      btnLanjut.type = 'button';
      btnLanjut.className = 'wizard-action-btn primary';
      btnLanjut.textContent = '🚀 Lanjutkan Pengajuan';
      btnLanjut.addEventListener('click', () => {
        btnLanjut.disabled = true;
        startResolutionSelection();
      });
      actionsDiv.appendChild(btnLanjut);
    }

    const btnRestart = document.createElement('button');
    btnRestart.type = 'button';
    btnRestart.className = 'wizard-action-btn secondary';
    btnRestart.textContent = '🔄 Mulai Ulang';
    btnRestart.addEventListener('click', () => {
      resetWizardState();
      startWizard();
    });
    actionsDiv.appendChild(btnRestart);

    const btnTanyaAI = document.createElement('button');
    btnTanyaAI.type = 'button';
    btnTanyaAI.className = 'wizard-action-btn ai';
    btnTanyaAI.textContent = '🤖 Tanya AI Penjelasan';
    btnTanyaAI.addEventListener('click', () => {
      const promptAI = 'Jelaskan secara rinci alasan keputusan kelayakan retur saya dan langkah yang harus saya lakukan.';
      handleSendMessage(promptAI, {
        orderNumber: wizardState.data.orderNumber,
        eligibilityResult: resultData
      });
    });
    actionsDiv.appendChild(btnTanyaAI);

    card.appendChild(actionsDiv);
    bubble.appendChild(card);
    contentDiv.appendChild(meta);
    contentDiv.appendChild(bubble);

    row.appendChild(avatar);
    row.appendChild(contentDiv);

    chatMessages.appendChild(row);
    if (shouldScroll) scrollToBottom();
  }

  function startResolutionSelection() {
    wizardState.step = 'ASK_RESOLUTION';
    saveWizardState();

    appendWizardCardUI(
      '🛠️ Jenis Penyelesaian Retur',
      'Silakan pilih bentuk penyelesaian yang Anda inginkan:',
      [
        { label: '🔄 Penukaran Barang', value: 'exchange' },
        { label: '💰 Pengembalian Dana (Refund)', value: 'refund' },
        { label: '📐 Penggantian Ukuran', value: 'size_swap' }
      ],
      (selectedOpt) => {
        appendMessageUI('user', selectedOpt.label);
        wizardState.data.resolution = selectedOpt.value;
        wizardState.step = 'ASK_CATEGORY';
        saveWizardState();
        startCategorySelection();
      }
    );
  }

  function startCategorySelection() {
    appendWizardCardUI(
      '📦 Kategori Barang',
      'Pilih kategori barang yang ingin dikembalikan untuk mendapatkan panduan pengemasan khusus:',
      [
        { label: '👕 Fashion (Pakaian, Sepatu, Tas)', value: 'fashion' },
        { label: '📱 Elektronik & Gadget', value: 'electronics' },
        { label: '💍 Aksesori & Perhiasan', value: 'accessories' },
        { label: '🏠 Peralatan Rumah Tangga', value: 'home_appliances' },
        { label: '📦 Lainnya', value: 'other' }
      ],
      async (selectedOpt) => {
        appendMessageUI('user', selectedOpt.label);
        wizardState.data.category = selectedOpt.value;
        wizardState.step = 'CREATING_RETURN';
        saveWizardState();

        await submitCreateReturn();
      }
    );
  }

  async function submitCreateReturn() {
    setProcessingState(true);
    showTyping('Membuat kode retur & panduan pengemasan...');

    try {
      const response = await fetch('/api/returns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: wizardState.data.orderNumber,
          eligibilityResult: wizardState.result,
          resolution: wizardState.data.resolution,
          category: wizardState.data.category
        })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        showError(data.message || 'Gagal membuat kode retur.');
        return;
      }

      wizardState.step = 'COMPLETED';
      wizardState.createdReturn = data;
      saveWizardState();

      saveReturnToLocalStorage(data);
      renderReturnSummaryCardUI(data);
      showToast(`Kode Retur ${data.returnCode} berhasil dibuat!`);
    } catch (err) {
      console.error('Create return error:', err);
      showError('Terjadi gangguan jaringan saat membuat pengajuan retur.');
    } finally {
      hideTyping();
      setProcessingState(false);
      userInput.focus();
    }
  }

  function renderReturnSummaryCardUI(returnData) {
    const row = document.createElement('div');
    row.className = 'message-row bot';

    const avatar = createAvatar('bot');
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const meta = createMessageMeta('bot');
    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    const card = document.createElement('div');
    card.className = 'summary-card';

    const headerTitle = document.createElement('div');
    headerTitle.className = 'summary-header';
    headerTitle.textContent = '📦 Ringkasan Pengajuan Retur Simulasi';
    card.appendChild(headerTitle);

    const codeBox = document.createElement('div');
    codeBox.className = 'code-box';

    const codeVal = document.createElement('span');
    codeVal.className = 'code-value';
    codeVal.textContent = returnData.returnCode;

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = '📋 Salin Kode';
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(returnData.returnCode).then(() => {
        copyBtn.textContent = '✅ Tersalin!';
        showToast(`Kode retur '${returnData.returnCode}' tersalin ke clipboard.`);
        setTimeout(() => { copyBtn.textContent = '📋 Salin Kode'; }, 2000);
      }).catch(() => {
        alert(`Kode Retur: ${returnData.returnCode}`);
      });
    });

    codeBox.appendChild(codeVal);
    codeBox.appendChild(copyBtn);
    card.appendChild(codeBox);

    const detailsP = document.createElement('p');
    const resLabels = { exchange: 'Penukaran Barang', refund: 'Pengembalian Dana', size_swap: 'Penggantian Ukuran' };
    const catLabels = { fashion: 'Fashion', electronics: 'Elektronik', accessories: 'Aksesori', home_appliances: 'Peralatan Rumah', other: 'Lainnya' };

    detailsP.innerHTML = `<strong>Nomor Pesanan:</strong> ${returnData.orderNumber}<br>` +
      `<strong>Status Saat Ini:</strong> ${returnData.status}<br>` +
      `<strong>Jenis Penyelesaian:</strong> ${resLabels[returnData.resolution] || returnData.resolution}<br>` +
      `<strong>Kategori Barang:</strong> ${catLabels[returnData.category] || returnData.category}`;
    card.appendChild(detailsP);

    if (Array.isArray(returnData.packingInstructions) && returnData.packingInstructions.length > 0) {
      const packDiv = document.createElement('div');
      packDiv.className = 'result-requirements';
      const packTitle = document.createElement('h4');
      packTitle.textContent = `📋 Panduan Pengemasan (${catLabels[returnData.category] || returnData.category}):`;
      packDiv.appendChild(packTitle);

      const ul = document.createElement('ul');
      returnData.packingInstructions.forEach(inst => {
        const li = document.createElement('li');
        li.textContent = inst;
        ul.appendChild(li);
      });
      packDiv.appendChild(ul);
      card.appendChild(packDiv);
    }

    const addrBox = document.createElement('div');
    addrBox.className = 'address-box';
    const addrTitle = document.createElement('div');
    addrTitle.className = 'address-title';
    addrTitle.textContent = '📍 Alamat Pengiriman Paket Retur:';
    addrBox.appendChild(addrTitle);

    const addrBody = document.createElement('p');
    const addr = returnData.shippingAddress;
    addrBody.innerHTML = `<strong>${addr.name}</strong><br>${addr.street}<br>${addr.city}, ${addr.province} ${addr.postalCode}`;
    addrBox.appendChild(addrBody);

    const addrNotice = document.createElement('div');
    addrNotice.className = 'simulation-address-notice';
    addrNotice.textContent = `⚠️ ${addr.notice}`;
    addrBox.appendChild(addrNotice);

    card.appendChild(addrBox);

    const refundWarn = document.createElement('div');
    refundWarn.className = 'refund-warning-box';
    refundWarn.textContent = 'ℹ️ Catatan: Pengembalian dana (refund) belum diproses/dijanjikan sebelum paket fisik diterima di gudang dan selesai diinspeksi oleh tim quality control.';
    card.appendChild(refundWarn);

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'wizard-actions';

    const btnLacakThis = document.createElement('button');
    btnLacakThis.type = 'button';
    btnLacakThis.className = 'wizard-action-btn primary';
    btnLacakThis.textContent = '🔍 Lacak Status Retur Ini';
    btnLacakThis.addEventListener('click', () => {
      appendMessageUI('user', `Lacak status ${returnData.returnCode}`);
      displayTrackingCardUI(returnData);
    });
    actionsDiv.appendChild(btnLacakThis);

    card.appendChild(actionsDiv);
    bubble.appendChild(card);
    contentDiv.appendChild(meta);
    contentDiv.appendChild(bubble);

    row.appendChild(avatar);
    row.appendChild(contentDiv);

    chatMessages.appendChild(row);
    scrollToBottom();
  }

  function startTrackingFlow() {
    hideError();
    wizardState.step = 'ASK_TRACKING_CODE';
    saveWizardState();

    const storedReturns = getReturnsFromStorage();
    if (storedReturns.length > 0) {
      const options = storedReturns.map(r => ({
        label: `📦 ${r.returnCode} (${r.orderNumber})`,
        value: r.returnCode
      }));

      appendWizardCardUI(
        '🔍 Pelacakan Status Retur Simulasi',
        'Silakan pilih Kode Retur dari riwayat Anda atau ketik kode retur manual (Contoh: RTR-20260801-A7K2):',
        options,
        (selectedOpt) => {
          appendMessageUI('user', selectedOpt.value);
          handleTrackingCodeInput(selectedOpt.value);
        }
      );
    } else {
      appendMessageUI('bot', '🔍 Pelacakan Status Retur Simulasi\nSilakan ketik Kode Retur Anda (Contoh: RTR-20260801-A7K2):');
    }

    userInput.placeholder = 'Ketik Kode Retur (Contoh: RTR-20260801-A7K2)...';
    userInput.focus();
  }

  function handleTrackingCodeInput(codeText) {
    const searchCode = (codeText || '').trim().toUpperCase();
    resetWizardState();

    const formatRegex = /^RTR-\d{8}-[A-Z0-9]{4}$/;
    if (!formatRegex.test(searchCode)) {
      appendMessageUI('bot', `❌ Format kode retur '${searchCode}' tidak valid.\n\nFormat kode retur harus diawali "RTR-" diikuti 8 digit tanggal dan 4 karakter alfanumerik (Contoh: \`RTR-20260801-A7K2\`).`);
      return;
    }

    const returnsList = getReturnsFromStorage();
    const foundReturn = returnsList.find(r => r.returnCode === searchCode);

    if (!foundReturn) {
      const row = document.createElement('div');
      row.className = 'message-row bot';

      const avatar = createAvatar('bot');
      const contentDiv = document.createElement('div');
      contentDiv.className = 'message-content';

      const meta = createMessageMeta('bot');
      const bubble = document.createElement('div');
      bubble.className = 'bubble';

      const notFoundP = document.createElement('p');
      notFoundP.innerHTML = `⚠️ <strong>Kode Retur Tidak Ditemukan</strong><br>Kode retur <code>${searchCode}</code> tidak terdaftar dalam data simulasi Anda.`;
      bubble.appendChild(notFoundP);

      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'wizard-actions';

      const btnAjukanBaru = document.createElement('button');
      btnAjukanBaru.className = 'wizard-action-btn primary';
      btnAjukanBaru.textContent = '📋 Ajukan Retur Baru';
      btnAjukanBaru.addEventListener('click', () => {
        startWizard();
      });

      const btnCariLain = document.createElement('button');
      btnCariLain.className = 'wizard-action-btn secondary';
      btnCariLain.textContent = '🔄 Cari Kode Lain';
      btnCariLain.addEventListener('click', () => {
        startTrackingFlow();
      });

      actionsDiv.appendChild(btnAjukanBaru);
      actionsDiv.appendChild(btnCariLain);
      bubble.appendChild(actionsDiv);
      contentDiv.appendChild(meta);
      contentDiv.appendChild(bubble);

      row.appendChild(avatar);
      row.appendChild(contentDiv);

      chatMessages.appendChild(row);
      scrollToBottom();
      return;
    }

    displayTrackingCardUI(foundReturn);
  }

  function displayTrackingCardUI(returnData) {
    const row = document.createElement('div');
    row.className = 'message-row bot';

    const avatar = createAvatar('bot');
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const meta = createMessageMeta('bot');
    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    const card = document.createElement('div');
    card.className = 'tracking-card';

    const notice = document.createElement('div');
    notice.className = 'tracking-notice';
    notice.textContent = '🏷️ Pelacakan Simulasi Final Project (Bukan Data Kurir Nyata)';
    card.appendChild(notice);

    const resLabels = { exchange: 'Penukaran Barang', refund: 'Pengembalian Dana', size_swap: 'Penggantian Ukuran' };
    const grid = document.createElement('div');
    grid.className = 'tracking-info-grid';
    grid.innerHTML = `
      <div class="info-item"><span class="info-label">Kode Retur</span><span class="info-val">${returnData.returnCode}</span></div>
      <div class="info-item"><span class="info-label">No. Pesanan</span><span class="info-val">${returnData.orderNumber}</span></div>
      <div class="info-item"><span class="info-label">Penyelesaian</span><span class="info-val">${resLabels[returnData.resolution] || returnData.resolution}</span></div>
      <div class="info-item"><span class="info-label">Pembaruan</span><span class="info-val">${formatFullDateTime(returnData.updatedAt || returnData.createdAt)}</span></div>
    `;
    card.appendChild(grid);

    const tTitle = document.createElement('div');
    tTitle.className = 'timeline-title';
    tTitle.textContent = `📍 Status Saat Ini: ${returnData.status}`;
    card.appendChild(tTitle);

    const timelineList = document.createElement('div');
    timelineList.className = 'timeline-list';

    const currentStageIndex = TRACKING_STAGES.indexOf(returnData.status);

    TRACKING_STAGES.forEach((stageName, idx) => {
      const step = document.createElement('div');
      let stepClass = 'timeline-step';
      let iconContent = `${idx + 1}`;

      if (idx < currentStageIndex) {
        stepClass += ' completed';
        iconContent = '✓';
      } else if (idx === currentStageIndex) {
        stepClass += ' current';
        iconContent = '●';
      } else {
        stepClass += ' pending';
      }

      step.className = stepClass;

      const node = document.createElement('div');
      node.className = 'node-icon';
      node.textContent = iconContent;

      const nameSpan = document.createElement('span');
      nameSpan.className = 'step-name';
      nameSpan.textContent = stageName;

      step.appendChild(node);
      step.appendChild(nameSpan);

      if (Array.isArray(returnData.statusHistory)) {
        const historyItem = returnData.statusHistory.find(h => h.status === stageName);
        if (historyItem && historyItem.timestamp) {
          const timeSpan = document.createElement('span');
          timeSpan.className = 'step-time';
          timeSpan.textContent = formatFullDateTime(historyItem.timestamp);
          step.appendChild(timeSpan);
        }
      }

      timelineList.appendChild(step);
    });

    card.appendChild(timelineList);

    const demoBox = document.createElement('div');
    demoBox.className = 'demo-mode-box';

    const demoTitle = document.createElement('div');
    demoTitle.className = 'demo-title';
    demoTitle.textContent = '🎮 Mode Demonstrasi Status Retur (Simulasi)';

    const demoBtn = document.createElement('button');
    demoBtn.type = 'button';
    demoBtn.className = 'demo-btn';

    if (currentStageIndex < TRACKING_STAGES.length - 1) {
      const nextStageName = TRACKING_STAGES[currentStageIndex + 1];
      demoBtn.textContent = `⏩ Simulasikan Status Berikutnya: "${nextStageName}"`;
      demoBtn.addEventListener('click', () => {
        demoBtn.disabled = true;

        const nowIso = new Date().toISOString();
        returnData.status = nextStageName;
        returnData.updatedAt = nowIso;
        if (!Array.isArray(returnData.statusHistory)) {
          returnData.statusHistory = [];
        }
        returnData.statusHistory.push({ status: nextStageName, timestamp: nowIso });

        updateReturnInLocalStorage(returnData);
        showToast(`Status retur '${returnData.returnCode}' berhasil diperbarui ke: "${nextStageName}"`);

        row.remove();
        displayTrackingCardUI(returnData);
      });
    } else {
      demoBtn.textContent = '🎉 Retur Telah Selesai (Tahap Akhir)';
      demoBtn.disabled = true;
    }

    demoBox.appendChild(demoTitle);
    demoBox.appendChild(demoBtn);
    card.appendChild(demoBox);

    bubble.appendChild(card);
    contentDiv.appendChild(meta);
    contentDiv.appendChild(bubble);

    row.appendChild(avatar);
    row.appendChild(contentDiv);

    chatMessages.appendChild(row);
    scrollToBottom();
  }

  function startWizard() {
    hideError();
    wizardState.step = 'ASK_ORDER';
    wizardState.data = { orderNumber: null, sealAvailable: null, daysRange: null, reason: null, resolution: null, category: null };
    wizardState.result = null;
    wizardState.createdReturn = null;
    saveWizardState();

    appendMessageUI('bot', '📋 Form Pengecekan Kelayakan Retur\nSilakan ketik Nomor Pesanan Anda (Contoh: ORD-2026-00125):');
    userInput.placeholder = 'Ketik Nomor Pesanan (Contoh: ORD-2026-00125)...';
    userInput.focus();
  }

  function handleOrderNumberInput(orderText) {
    wizardState.data.orderNumber = orderText;
    wizardState.step = 'ASK_SEAL';
    saveWizardState();
    userInput.placeholder = 'Tulis kendala barang Anda...';

    appendWizardCardUI(
      '🏷️ Pertanyaan 1 dari 3',
      'Apakah label atau segel barang masih tersedia dan belum dilepas?',
      [
        { label: '✅ Ya, Masih Utuh', value: true },
        { label: '❌ Tidak Ada / Dilepas', value: false }
      ],
      (selectedOpt) => {
        appendMessageUI('user', selectedOpt.label);
        wizardState.data.sealAvailable = selectedOpt.value;
        wizardState.step = 'ASK_DAYS';
        saveWizardState();
        renderQuestionDays();
      }
    );
  }

  function renderQuestionDays() {
    appendWizardCardUI(
      '📅 Pertanyaan 2 dari 3',
      'Berapa hari sejak barang diterima?',
      [
        { label: '⏱️ 0 – 7 Hari', value: '0-7' },
        { label: '🗓️ 8 – 14 Hari', value: '8-14' },
        { label: '⚠️ Lebih dari 14 Hari', value: '>14' }
      ],
      (selectedOpt) => {
        appendMessageUI('user', selectedOpt.label);
        wizardState.data.daysRange = selectedOpt.value;
        wizardState.step = 'ASK_REASON';
        saveWizardState();
        renderQuestionReason();
      }
    );
  }

  function renderQuestionReason() {
    appendWizardCardUI(
      '📦 Pertanyaan 3 dari 3',
      'Apa alasan pengembalian barang?',
      [
        { label: '📐 Salah Ukuran', value: 'wrong_size' },
        { label: '💥 Barang Rusak', value: 'damaged' },
        { label: '❌ Tidak Sesuai Pesanan', value: 'not_as_described' },
        { label: '🔄 Berubah Pikiran', value: 'changed_mind' }
      ],
      async (selectedOpt) => {
        appendMessageUI('user', selectedOpt.label);
        wizardState.data.reason = selectedOpt.value;
        wizardState.step = 'CHECKING';
        saveWizardState();

        await submitEligibilityCheck();
      }
    );
  }

  async function submitEligibilityCheck() {
    setProcessingState(true);
    showTyping('Memeriksa kelayakan retur sistem...');

    try {
      const response = await fetch('/api/returns/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wizardState.data)
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        showError(data.message || 'Gagal memeriksa kelayakan retur.');
        return;
      }

      wizardState.step = 'RESULT';
      wizardState.result = data;
      saveWizardState();

      renderResultCardUI(data);
    } catch (err) {
      console.error('Eligibility check error:', err);
      showError('Terjadi gangguan jaringan saat memeriksa kelayakan retur.');
    } finally {
      hideTyping();
      setProcessingState(false);
      userInput.focus();
    }
  }

  // Main chat sending handler
  async function handleSendMessage(customText, customContext) {
    if (isProcessing) return;

    const rawInput = customText !== undefined ? customText : userInput.value;
    const textToSend = typeof rawInput === 'string' ? rawInput.trim() : '';

    if (!textToSend) return;

    // Step handlers
    if (wizardState.step === 'ASK_ORDER' && customText === undefined) {
      appendMessageUI('user', textToSend);
      userInput.value = '';
      handleOrderNumberInput(textToSend);
      return;
    }

    if (wizardState.step === 'ASK_TRACKING_CODE' && customText === undefined) {
      appendMessageUI('user', textToSend);
      userInput.value = '';
      handleTrackingCodeInput(textToSend);
      return;
    }

    hideError();

    appendMessageUI('user', textToSend);
    conversationHistory.push({ role: 'user', text: textToSend });
    saveHistory();

    if (customText === undefined) {
      userInput.value = '';
    }

    setProcessingState(true);
    showTyping('CepatRetur sedang memeriksa...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const contextPayload = customContext || {
      orderNumber: wizardState.data.orderNumber,
      eligibilityResult: wizardState.result
    };

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation: conversationHistory,
          context: contextPayload
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok || data.error) {
        showError(data.message || 'Maaf, terjadi kendala saat memproses permintaan Anda.');
        return;
      }

      if (data.result) {
        appendMessageUI('bot', data.result);
        conversationHistory.push({ role: 'model', text: data.result });
        saveHistory();
      }
    } catch (err) {
      clearTimeout(timeoutId);

      let errMessageStr = 'Maaf, terjadi gangguan koneksi ke server. Silakan coba lagi.';
      if (err.name === 'AbortError') {
        errMessageStr = 'Permintaan membutuhkan waktu terlalu lama. Silakan coba lagi.';
      }
      showError(errMessageStr);
    } finally {
      hideTyping();
      setProcessingState(false);
      userInput.focus();
    }
  }

  // Form submit listener
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSendMessage();
  });

  // Reset chat listener
  resetBtn.addEventListener('click', () => {
    if (confirm('Apakah Anda yakin ingin menghapus percakapan saat ini?')) {
      resetChatSessionOnly();
    }
  });

  // Close error banner
  closeErrorBtn.addEventListener('click', hideError);

  // Quick Action Buttons
  if (btnAjukan) {
    btnAjukan.addEventListener('click', () => {
      startWizard();
    });
  }

  if (btnLacak) {
    btnLacak.addEventListener('click', () => {
      startTrackingFlow();
    });
  }

  if (btnKebijakan) {
    btnKebijakan.addEventListener('click', () => {
      handleSendMessage('Jelaskan secara singkat kebijakan retur yang tersedia dalam demo CepatRetur.');
    });
  }

  if (btnMenuUtama) {
    btnMenuUtama.addEventListener('click', () => {
      resetWizardState();
      appendMessageUI('bot', 'Anda kembali ke Menu Utama CepatRetur. Silakan pilih menu di atas atau ketik pertanyaan Anda.');
    });
  }
});
