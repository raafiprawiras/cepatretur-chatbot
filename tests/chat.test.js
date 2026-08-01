import test from 'node:test';
import assert from 'node:assert';
import express from 'express';
import cors from 'cors';
import chatRoute from '../routes/chatRoute.js';
import { validateChatPayload } from '../utils/validation.js';

test('validateChatPayload returns error when conversation is not array', () => {
  const result = validateChatPayload({ conversation: 'not an array' });
  assert.strictEqual(result.valid, false);
  assert.ok(result.message.includes('harus berupa array'));
});

test('validateChatPayload returns error when text is empty', () => {
  const result = validateChatPayload({
    conversation: [{ role: 'user', text: '   ' }]
  });
  assert.strictEqual(result.valid, false);
  assert.ok(result.message.includes('wajib diisi'));
});

test('validateChatPayload returns error when role is invalid', () => {
  const result = validateChatPayload({
    conversation: [{ role: 'admin', text: 'Halo' }]
  });
  assert.strictEqual(result.valid, false);
  assert.ok(result.message.includes('Role pada pesan'));
});

test('validateChatPayload succeeds for valid payload', () => {
  const result = validateChatPayload({
    conversation: [
      { role: 'user', text: 'Bagaimana cara mengembalikan barang rusak?' }
    ]
  });
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.data.conversation.length, 1);
  assert.strictEqual(result.data.conversation[0].text, 'Bagaimana cara mengembalikan barang rusak?');
});

test('POST /api/chat returns 400 for invalid payload', async () => {
  const app = express();
  app.use(express.json());
  app.use('/api', chatRoute);

  const server = app.listen(0);
  const port = server.address().port;

  const res = await fetch(`http://localhost:${port}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversation: "not an array" })
  });

  const data = await res.json();
  assert.strictEqual(res.status, 400);
  assert.strictEqual(data.error, true);
  assert.ok(typeof data.message === 'string');

  server.close();
});

test('POST /api/chat returns error message cleanly when API key missing or invalid', async () => {
  const originalEnv = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'your_gemini_api_key';

  const app = express();
  app.use(express.json());
  app.use('/api', chatRoute);

  const server = app.listen(0);
  const port = server.address().port;

  const res = await fetch(`http://localhost:${port}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      conversation: [{ role: 'user', text: 'Bagaimana prosedur retur?' }]
    })
  });

  const data = await res.json();
  assert.strictEqual(data.error, true);
  assert.ok(data.message.includes('GEMINI_API_KEY'));

  // Restore original env
  process.env.GEMINI_API_KEY = originalEnv;
  server.close();
});
