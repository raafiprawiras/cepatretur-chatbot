// CepatRetur — Client Script with Session Storage, Custom Profile Avatars & SVG Icon System
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

  // ============================================================
  // SVG ICON REGISTRY — Minimal Color-Line Logistics Icons
  // All icons: viewBox 0 0 24 24, stroke-based, 1.8 stroke-width
  // ============================================================
  const ICON_SVG = {
    // --- General UI ---
    'check-circle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    'x-circle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    'info-circle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    'alert-triangle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    'x': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    'refresh': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',
    'copy': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    'check': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"/></svg>',
    'search': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    'map-pin': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    'arrow-right': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    'skip-forward': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>',
    'sparkle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"/></svg>',
    'party': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5.8 11.3L2 22l10.7-3.8"/><path d="M4 3h.01M22 8h.01M15 2h.01M22 20h.01M8 2V4M20 10h2M2 10h2M20 22v-2"/><path d="M9.4 14.6l4.2-4.2c1.2-1.2 3.1-1.2 4.2 0 1.2 1.2 1.2 3.1 0 4.2l-4.2 4.2"/></svg>',

    // --- Logistics / Package ---
    'package': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    'package-return': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/><path d="M12 12l-5 7" stroke="#96cf1e" stroke-width="2"/></svg>',
    'package-search': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/><circle cx="18" cy="18" r="3" stroke="#1b70de" stroke-width="2"/><line x1="20.2" y1="20.2" x2="22" y2="22" stroke="#1b70de" stroke-width="2"/></svg>',
    'box': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    'truck': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',

    // --- Flow / Wizard ---
    'tag': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
    'calendar-clock': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="12" cy="16" r="2.5"/><line x1="12" y1="14.5" x2="12" y2="16" stroke-width="2"/><line x1="12" y1="16" x2="13.5" y2="16" stroke-width="2"/></svg>',
    'receipt': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 3 2V2l-3 2-3-2-3 2-3-2-3 2-3-2z"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="13" y2="14"/></svg>',
    'shield-check': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>',
    'arrows-swap': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polyline points="17 1 21 5 17 9"/><line x1="3" y1="5" x2="21" y2="5"/><polyline points="7 23 3 19 7 15"/><line x1="21" y1="19" x2="3" y2="19"/></svg>',
    'wallet': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="2" y="5" width="20" height="15" rx="2"/><path d="M16 10h4v4h-4a2 2 0 0 1 0-4z"/><line x1="2" y1="10" x2="8" y2="10"/></svg>',
    'ruler': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M21.73 18l-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z"/><line x1="8" y1="21" x2="8" y2="17"/><line x1="12" y1="21" x2="12" y2="15"/><line x1="16" y1="21" x2="16" y2="17"/></svg>',

    // --- Category ---
    'shirt': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 1 .84H6v10h12V10h2.14a1 1 0 0 0 1-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>',
    'smartphone': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
    'gem': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polygon points="6 3 18 3 22 9 12 22 2 9 6 3"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="12" y1="22" x2="8" y2="9"/><line x1="12" y1="22" x2="16" y2="9"/><line x1="6" y1="3" x2="8" y2="9"/><line x1="18" y1="3" x2="16" y2="9"/></svg>',
    'home': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',

    // --- Reason ---
    'package-alert': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="10" stroke="#ff5c68" stroke-width="2.2"/><circle cx="12" cy="6" r="0.5" fill="#ff5c68" stroke="#ff5c68"/></svg>',
    'zap': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',

    // --- Tracking Timeline ---
    'file-plus': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>',
    'clock': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    'warehouse': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.7l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35z"/><line x1="6" y1="18" x2="6" y2="14"/><line x1="10" y1="18" x2="10" y2="14"/><line x1="14" y1="18" x2="14" y2="14"/><line x1="18" y1="18" x2="18" y2="14"/></svg>',
    'scan': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/></svg>',
    'wallet-arrow': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="2" y="5" width="20" height="15" rx="2"/><path d="M16 10h4v4h-4a2 2 0 0 1 0-4z"/><polyline points="9 12 6 15 9 18"/><line x1="6" y1="15" x2="14" y2="15"/></svg>',
    'circle-check': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11.5 14.5 16 10"/></svg>',

    // --- Document / Clipboard ---
    'clipboard-list': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="14" y2="15"/></svg>',
    'document-info': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><circle cx="12" cy="15" r="2.5" stroke="#1b70de" stroke-width="1.6"/><line x1="12" y1="12.5" x2="12" y2="11"/></svg>',
    'ticket': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M2 9a3 3 0 0 1 0 6v5h20v-5a3 3 0 0 1 0-6V4H2v5z"/><line x1="13" y1="4" x2="13" y2="9" stroke-dasharray="2 2"/><line x1="13" y1="15" x2="13" y2="20" stroke-dasharray="2 2"/></svg>',

    // --- Simulation / Demo ---
    'flask': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9 3h6l1 7H8L9 3z"/><path d="M8 10c0 4 2 11 4 11s4-7 4-11"/><line x1="7" y1="3" x2="17" y2="3"/></svg>',
    'grid-4': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  };

  // Timeline stage icons (ordered)
  const TIMELINE_ICONS = [
    'file-plus', 'clock', 'truck', 'warehouse',
    'scan', 'shield-check', 'wallet-arrow', 'circle-check'
  ];

  /**
   * Creates an inline SVG icon element.
   * @param {string} name - Icon name from ICON_SVG registry.
   * @param {object} [opts] - Options: { size: 'sm'|'md'|'lg'|'xl', color: 'primary'|'secondary'|'muted'|'danger'|'warning'|'light' }
   * @returns {HTMLElement} - A span.app-icon element containing the SVG.
   */
  function createIcon(name, opts) {
    const span = document.createElement('span');
    const sizeClass = opts && opts.size ? ` icon-${opts.size}` : '';
    const colorClass = opts && opts.color ? ` icon-${opts.color}` : '';
    span.className = `app-icon${sizeClass}${colorClass}`;
    span.setAttribute('aria-hidden', 'true');
    const svgStr = ICON_SVG[name];
    if (svgStr) {
      span.innerHTML = svgStr;
    }
    return span;
  }

  let conversationHistory = [];
  let isProcessing = false;

  // App State Machine
  let wizardState = {
    step: 'IDLE',
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

  function showToast(message, type) {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification';

    const iconName = type === 'error' ? 'x-circle' : type === 'warning' ? 'alert-triangle' : 'check-circle';
    const iconColor = type === 'error' ? 'danger' : type === 'warning' ? 'warning' : 'primary';
    const icon = createIcon(iconName, { size: 'sm', color: iconColor });
    toast.appendChild(icon);

    const textSpan = document.createElement('span');
    textSpan.textContent = message;
    toast.appendChild(textSpan);

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
    avatar.setAttribute('role', 'img');
    avatar.setAttribute('aria-label', sender === 'user' ? 'Pengguna' : 'CepatRetur AI');

    if (sender === 'user') {
      avatar.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
    } else {
      const botImg = document.createElement('img');
      botImg.src = '/images/Favicon-CepatRetur.png';
      botImg.alt = '';
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
    cancelBtn.appendChild(createIcon('x', { size: 'sm', color: 'muted' }));
    const cancelText = document.createTextNode(' Batalkan & Kembali ke Menu Utama');
    cancelBtn.appendChild(cancelText);
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
      badge.appendChild(createIcon('check-circle', { size: 'sm', color: 'primary' }));
      const badgeText = document.createTextNode(' LAYAK RETUR');
      badge.appendChild(badgeText);
    } else if (resultData.eligible && resultData.reviewRequired) {
      badge.className = 'result-badge review';
      badge.appendChild(createIcon('info-circle', { size: 'sm', color: 'warning' }));
      const badgeText = document.createTextNode(' MEMERLUKAN INSPEKSI BUKTI FOTO/VIDEO');
      badge.appendChild(badgeText);
    } else {
      badge.className = 'result-badge rejected';
      badge.appendChild(createIcon('x-circle', { size: 'sm', color: 'danger' }));
      const badgeText = document.createTextNode(' TIDAK LAYAK RETUR');
      badge.appendChild(badgeText);
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
      btnLanjut.appendChild(createIcon('arrow-right', { size: 'sm' }));
      const lanjutText = document.createTextNode(' Lanjutkan Pengajuan');
      btnLanjut.appendChild(lanjutText);
      btnLanjut.addEventListener('click', () => {
        btnLanjut.disabled = true;
        startResolutionSelection();
      });
      actionsDiv.appendChild(btnLanjut);
    }

    const btnRestart = document.createElement('button');
    btnRestart.type = 'button';
    btnRestart.className = 'wizard-action-btn secondary';
    btnRestart.appendChild(createIcon('refresh', { size: 'sm' }));
    const restartText = document.createTextNode(' Mulai Ulang');
    btnRestart.appendChild(restartText);
    btnRestart.addEventListener('click', () => {
      resetWizardState();
      startWizard();
    });
    actionsDiv.appendChild(btnRestart);

    const btnTanyaAI = document.createElement('button');
    btnTanyaAI.type = 'button';
    btnTanyaAI.className = 'wizard-action-btn ai';
    btnTanyaAI.appendChild(createIcon('sparkle', { size: 'sm' }));
    const aiText = document.createTextNode(' Tanya AI Penjelasan');
    btnTanyaAI.appendChild(aiText);
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
      'Jenis Penyelesaian Retur',
      'Silakan pilih bentuk penyelesaian yang Anda inginkan:',
      [
        { label: 'Penukaran Barang', value: 'exchange' },
        { label: 'Pengembalian Dana (Refund)', value: 'refund' },
        { label: 'Penggantian Ukuran', value: 'size_swap' }
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
      'Kategori Barang',
      'Pilih kategori barang yang ingin dikembalikan untuk mendapatkan panduan pengemasan khusus:',
      [
        { label: 'Fashion (Pakaian, Sepatu, Tas)', value: 'fashion' },
        { label: 'Elektronik & Gadget', value: 'electronics' },
        { label: 'Aksesori & Perhiasan', value: 'accessories' },
        { label: 'Peralatan Rumah Tangga', value: 'home_appliances' },
        { label: 'Lainnya', value: 'other' }
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
    headerTitle.appendChild(createIcon('ticket', { size: 'md', color: 'primary' }));
    const headerText = document.createTextNode(' Ringkasan Pengajuan Retur Simulasi');
    headerTitle.appendChild(headerText);
    card.appendChild(headerTitle);

    const codeBox = document.createElement('div');
    codeBox.className = 'code-box';

    const codeVal = document.createElement('span');
    codeVal.className = 'code-value';
    codeVal.textContent = returnData.returnCode;

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'copy-btn';
    copyBtn.setAttribute('aria-label', 'Salin Kode Retur');
    copyBtn.appendChild(createIcon('copy', { size: 'sm' }));
    const copyText = document.createTextNode(' Salin Kode');
    copyBtn.appendChild(copyText);
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(returnData.returnCode).then(() => {
        copyBtn.innerHTML = '';
        copyBtn.appendChild(createIcon('check', { size: 'sm' }));
        const doneText = document.createTextNode(' Tersalin!');
        copyBtn.appendChild(doneText);
        showToast(`Kode retur '${returnData.returnCode}' tersalin ke clipboard.`);
        setTimeout(() => {
          copyBtn.innerHTML = '';
          copyBtn.appendChild(createIcon('copy', { size: 'sm' }));
          const resetText = document.createTextNode(' Salin Kode');
          copyBtn.appendChild(resetText);
        }, 2000);
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
      packTitle.appendChild(createIcon('clipboard-list', { size: 'sm', color: 'primary' }));
      const packTitleText = document.createTextNode(` Panduan Pengemasan (${catLabels[returnData.category] || returnData.category}):`);
      packTitle.appendChild(packTitleText);
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
    addrTitle.appendChild(createIcon('map-pin', { size: 'sm', color: 'secondary' }));
    const addrTitleText = document.createTextNode(' Alamat Pengiriman Paket Retur:');
    addrTitle.appendChild(addrTitleText);
    addrBox.appendChild(addrTitle);

    const addrBody = document.createElement('p');
    const addr = returnData.shippingAddress;
    addrBody.innerHTML = `<strong>${addr.name}</strong><br>${addr.street}<br>${addr.city}, ${addr.province} ${addr.postalCode}`;
    addrBox.appendChild(addrBody);

    const addrNotice = document.createElement('div');
    addrNotice.className = 'simulation-address-notice';
    addrNotice.appendChild(createIcon('alert-triangle', { size: 'sm', color: 'warning' }));
    const addrNoticeText = document.createTextNode(` ${addr.notice}`);
    addrNotice.appendChild(addrNoticeText);
    addrBox.appendChild(addrNotice);

    card.appendChild(addrBox);

    const refundWarn = document.createElement('div');
    refundWarn.className = 'refund-warning-box';
    refundWarn.appendChild(createIcon('info-circle', { size: 'sm', color: 'danger' }));
    const refundText = document.createTextNode(' Catatan: Pengembalian dana (refund) belum diproses/dijanjikan sebelum paket fisik diterima di gudang dan selesai diinspeksi oleh tim quality control.');
    refundWarn.appendChild(refundText);
    card.appendChild(refundWarn);

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'wizard-actions';

    const btnLacakThis = document.createElement('button');
    btnLacakThis.type = 'button';
    btnLacakThis.className = 'wizard-action-btn primary';
    btnLacakThis.appendChild(createIcon('search', { size: 'sm' }));
    const lacakText = document.createTextNode(' Lacak Status Retur Ini');
    btnLacakThis.appendChild(lacakText);
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
        label: `${r.returnCode} (${r.orderNumber})`,
        value: r.returnCode
      }));

      appendWizardCardUI(
        'Pelacakan Status Retur Simulasi',
        'Silakan pilih Kode Retur dari riwayat Anda atau ketik kode retur manual (Contoh: RTR-20260801-A7K2):',
        options,
        (selectedOpt) => {
          appendMessageUI('user', selectedOpt.value);
          handleTrackingCodeInput(selectedOpt.value);
        }
      );
    } else {
      appendMessageUI('bot', 'Pelacakan Status Retur Simulasi\nSilakan ketik Kode Retur Anda (Contoh: RTR-20260801-A7K2):');
    }

    userInput.placeholder = 'Ketik Kode Retur (Contoh: RTR-20260801-A7K2)...';
    userInput.focus();
  }

  function handleTrackingCodeInput(codeText) {
    const searchCode = (codeText || '').trim().toUpperCase();
    resetWizardState();

    const formatRegex = /^RTR-\d{8}-[A-Z0-9]{4}$/;
    if (!formatRegex.test(searchCode)) {
      appendMessageUI('bot', `Format kode retur '${searchCode}' tidak valid.\n\nFormat kode retur harus diawali "RTR-" diikuti 8 digit tanggal dan 4 karakter alfanumerik (Contoh: RTR-20260801-A7K2).`);
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
      notFoundP.innerHTML = `<strong>Kode Retur Tidak Ditemukan</strong><br>Kode retur <code>${searchCode}</code> tidak terdaftar dalam data simulasi Anda.`;
      bubble.appendChild(notFoundP);

      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'wizard-actions';

      const btnAjukanBaru = document.createElement('button');
      btnAjukanBaru.className = 'wizard-action-btn primary';
      btnAjukanBaru.appendChild(createIcon('package-return', { size: 'sm' }));
      const ajukanText = document.createTextNode(' Ajukan Retur Baru');
      btnAjukanBaru.appendChild(ajukanText);
      btnAjukanBaru.addEventListener('click', () => {
        startWizard();
      });

      const btnCariLain = document.createElement('button');
      btnCariLain.className = 'wizard-action-btn secondary';
      btnCariLain.appendChild(createIcon('refresh', { size: 'sm' }));
      const cariText = document.createTextNode(' Cari Kode Lain');
      btnCariLain.appendChild(cariText);
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
    notice.appendChild(createIcon('flask', { size: 'sm', color: 'warning' }));
    const noticeText = document.createTextNode(' Pelacakan Simulasi Final Project (Bukan Data Kurir Nyata)');
    notice.appendChild(noticeText);
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
    tTitle.appendChild(createIcon('map-pin', { size: 'sm', color: 'primary' }));
    const tTitleText = document.createTextNode(` Status Saat Ini: ${returnData.status}`);
    tTitle.appendChild(tTitleText);
    card.appendChild(tTitle);

    const timelineList = document.createElement('div');
    timelineList.className = 'timeline-list';

    const currentStageIndex = TRACKING_STAGES.indexOf(returnData.status);

    TRACKING_STAGES.forEach((stageName, idx) => {
      const step = document.createElement('div');
      let stepClass = 'timeline-step';

      if (idx < currentStageIndex) {
        stepClass += ' completed';
      } else if (idx === currentStageIndex) {
        stepClass += ' current';
      } else {
        stepClass += ' pending';
      }

      step.className = stepClass;

      const node = document.createElement('div');
      node.className = 'node-icon';

      // Use SVG icons for timeline nodes
      const iconName = TIMELINE_ICONS[idx] || 'circle-check';
      if (idx < currentStageIndex) {
        // Completed: show a check
        node.innerHTML = ICON_SVG['check'] || '';
      } else if (idx === currentStageIndex) {
        // Current: show the stage-specific icon
        node.innerHTML = ICON_SVG[iconName] || '';
      } else {
        // Pending: show the stage number
        node.textContent = `${idx + 1}`;
      }

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
    demoTitle.appendChild(createIcon('flask', { size: 'sm', color: 'secondary' }));
    const demoTitleText = document.createTextNode(' Mode Demonstrasi Status Retur (Simulasi)');
    demoTitle.appendChild(demoTitleText);

    const demoBtn = document.createElement('button');
    demoBtn.type = 'button';
    demoBtn.className = 'demo-btn';

    if (currentStageIndex < TRACKING_STAGES.length - 1) {
      const nextStageName = TRACKING_STAGES[currentStageIndex + 1];
      demoBtn.appendChild(createIcon('skip-forward', { size: 'sm' }));
      const demoBtnText = document.createTextNode(` Simulasikan Status Berikutnya: "${nextStageName}"`);
      demoBtn.appendChild(demoBtnText);
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
      demoBtn.appendChild(createIcon('party', { size: 'sm' }));
      const demoBtnText = document.createTextNode(' Retur Telah Selesai (Tahap Akhir)');
      demoBtn.appendChild(demoBtnText);
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

    appendMessageUI('bot', 'Form Pengecekan Kelayakan Retur\nSilakan ketik Nomor Pesanan Anda (Contoh: ORD-2026-00125):');
    userInput.placeholder = 'Ketik Nomor Pesanan (Contoh: ORD-2026-00125)...';
    userInput.focus();
  }

  function handleOrderNumberInput(orderText) {
    wizardState.data.orderNumber = orderText;
    wizardState.step = 'ASK_SEAL';
    saveWizardState();
    userInput.placeholder = 'Tulis kendala barang Anda...';

    appendWizardCardUI(
      'Pertanyaan 1 dari 3',
      'Apakah label atau segel barang masih tersedia dan belum dilepas?',
      [
        { label: 'Ya, Masih Utuh', value: true },
        { label: 'Tidak Ada / Dilepas', value: false }
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
      'Pertanyaan 2 dari 3',
      'Berapa hari sejak barang diterima?',
      [
        { label: '0 – 7 Hari', value: '0-7' },
        { label: '8 – 14 Hari', value: '8-14' },
        { label: 'Lebih dari 14 Hari', value: '>14' }
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
      'Pertanyaan 3 dari 3',
      'Apa alasan pengembalian barang?',
      [
        { label: 'Salah Ukuran', value: 'wrong_size' },
        { label: 'Barang Rusak', value: 'damaged' },
        { label: 'Tidak Sesuai Pesanan', value: 'not_as_described' },
        { label: 'Berubah Pikiran', value: 'changed_mind' }
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
