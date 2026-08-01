import test from 'node:test';
import assert from 'node:assert';
import { validateReturnCodeFormat, getNextStage, TRACKING_STAGES } from '../utils/trackingHelper.js';

test('1. validateReturnCodeFormat validates RTR-YYYYMMDD-XXXX format strictly', () => {
  assert.strictEqual(validateReturnCodeFormat('RTR-20260801-A7K2'), true);
  assert.strictEqual(validateReturnCodeFormat(' rtr-20260801-a7k2 '), true); // Normalized trim & uppercase
  assert.strictEqual(validateReturnCodeFormat('RTR-123-ABC'), false);
  assert.strictEqual(validateReturnCodeFormat('INVALID_CODE'), false);
});

test('2. TRACKING_STAGES contains exactly 8 sequential stages', () => {
  assert.strictEqual(TRACKING_STAGES.length, 8);
  assert.strictEqual(TRACKING_STAGES[0], 'Pengajuan dibuat');
  assert.strictEqual(TRACKING_STAGES[7], 'Retur selesai');
});

test('3. getNextStage advances status sequentially and stops at final stage', () => {
  assert.strictEqual(getNextStage('Pengajuan dibuat'), 'Menunggu pengiriman pelanggan');
  assert.strictEqual(getNextStage('Refund atau barang pengganti diproses'), 'Retur selesai');
  assert.strictEqual(getNextStage('Retur selesai'), null); // Cannot advance past final stage
});
