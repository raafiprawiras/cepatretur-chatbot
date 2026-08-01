import test from 'node:test';
import assert from 'node:assert';
import express from 'express';
import returnRoute from '../routes/returnRoute.js';
import { generateReturnCode } from '../services/returnService.js';

test('1. Format kode retur sesuai RTR-YYYYMMDD-XXXX', () => {
  const code = generateReturnCode();
  const pattern = /^RTR-\d{8}-[A-Z0-9]{4}$/;
  assert.ok(pattern.test(code), `Code ${code} does not match format RTR-YYYYMMDD-XXXX`);
});

test('2. Dua kode berturut-turut tidak sama (unik)', () => {
  const code1 = generateReturnCode();
  const code2 = generateReturnCode();
  assert.notStrictEqual(code1, code2);
});

test('3. Tanggal hari ini terdapat dalam kode retur (YYYYMMDD)', () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}${mm}${dd}`;

  const code = generateReturnCode();
  assert.ok(code.includes(dateStr), `Code ${code} does not include date string ${dateStr}`);
});

test('4. Backend membuat kode retur dan mengabaikan/tidak menerima kode dari input frontend', async () => {
  const app = express();
  app.use(express.json());
  app.use('/api', returnRoute);

  const server = app.listen(0);
  const port = server.address().port;

  // Frontend tries to inject a custom return code
  const res = await fetch(`http://localhost:${port}/api/returns/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderNumber: 'ORD-2026-00125',
      returnCode: 'CUSTOM-FAKE-CODE-999',
      eligibilityResult: { eligible: true, reviewRequired: false },
      resolution: 'exchange',
      category: 'fashion'
    })
  });

  const data = await res.json();
  assert.strictEqual(res.status, 200);
  // Verified: Backend generates its own RTR-YYYYMMDD-XXXX code and ignores the custom input
  assert.notStrictEqual(data.returnCode, 'CUSTOM-FAKE-CODE-999');
  assert.ok(data.returnCode.startsWith('RTR-'));

  server.close();
});
