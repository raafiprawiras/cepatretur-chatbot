import test from 'node:test';
import assert from 'node:assert';
import { validateChatPayload } from '../utils/validation.js';

test('1. Validasi menolak jika conversation bukan array', () => {
  const result = validateChatPayload({ conversation: 'bukan_array' });
  assert.strictEqual(result.valid, false);
  assert.ok(result.message.includes('harus berupa array'));
});

test('2. Validasi menolak jika role invalid (selain user dan model)', () => {
  const result = validateChatPayload({
    conversation: [{ role: 'admin', text: 'Halo CepatRetur' }]
  });
  assert.strictEqual(result.valid, false);
  assert.ok(result.message.includes('Role pada pesan'));
});

test('3. Validasi menolak jika text kosong atau hanya berisi spasi', () => {
  const result = validateChatPayload({
    conversation: [{ role: 'user', text: '   ' }]
  });
  assert.strictEqual(result.valid, false);
  assert.ok(result.message.includes('wajib diisi'));
});

test('4. Validasi menolak jika pesan terlalu panjang (> 2000 karakter)', () => {
  const longText = 'a'.repeat(2001);
  const result = validateChatPayload({
    conversation: [{ role: 'user', text: longText }]
  });
  assert.strictEqual(result.valid, false);
  assert.ok(result.message.includes('melebihi batas maksimal'));
});

test('5. Validasi menolak jika body request kosong atau null', () => {
  const resultNull = validateChatPayload(null);
  assert.strictEqual(resultNull.valid, false);

  const resultUndefined = validateChatPayload(undefined);
  assert.strictEqual(resultUndefined.valid, false);
});
