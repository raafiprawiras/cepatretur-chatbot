/**
 * Tracking Helper Utility for CepatRetur
 * Standard 8 timeline stages, validation, and progress tracking.
 */

export const TRACKING_STAGES = [
  'Pengajuan dibuat',
  'Menunggu pengiriman pelanggan',
  'Paket dikirim',
  'Paket diterima pusat retur',
  'Barang sedang diperiksa',
  'Retur disetujui',
  'Refund atau barang pengganti diproses',
  'Retur selesai'
];

export function validateReturnCodeFormat(code) {
  if (!code || typeof code !== 'string') return false;
  const trimmed = code.trim().toUpperCase();
  const pattern = /^RTR-\d{8}-[A-Z0-9]{4}$/;
  return pattern.test(trimmed);
}

export function getNextStage(currentStatus) {
  const currentIndex = TRACKING_STAGES.indexOf(currentStatus);
  if (currentIndex === -1) {
    return TRACKING_STAGES[1];
  }
  if (currentIndex < TRACKING_STAGES.length - 1) {
    return TRACKING_STAGES[currentIndex + 1];
  }
  return null; // Already at final stage
}
