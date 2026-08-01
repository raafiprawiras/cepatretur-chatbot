import test from 'node:test';
import assert from 'node:assert';
import express from 'express';
import returnRoute from '../routes/returnRoute.js';
import { generateReturnCode, getPackingInstructions } from '../services/returnService.js';

test('1. generateReturnCode creates unique codes with format RTR-YYYYMMDD-XXXX', () => {
  const code1 = generateReturnCode();
  const code2 = generateReturnCode();

  assert.ok(code1.startsWith('RTR-'));
  assert.ok(code2.startsWith('RTR-'));
  assert.notStrictEqual(code1, code2); // Unique codes
  assert.strictEqual(code1.length, 17); // RTR-YYYYMMDD-XXXX (17 chars)
});

test('2. getPackingInstructions produces category-specific instructions', () => {
  const fashionInst = getPackingInstructions('fashion');
  const electronicsInst = getPackingInstructions('electronics');
  const accessoriesInst = getPackingInstructions('accessories');

  assert.ok(fashionInst.some(i => i.includes('dicuci') || i.includes('label')));
  assert.ok(electronicsInst.some(i => i.includes('Matikan') || i.includes('bubble wrap')));
  assert.ok(accessoriesInst.some(i => i.includes('pouch') || i.includes('debu')));
  assert.notDeepStrictEqual(fashionInst, electronicsInst);
});

test('3. POST /api/returns/create succeeds for eligible return application', async () => {
  const app = express();
  app.use(express.json());
  app.use('/api', returnRoute);

  const server = app.listen(0);
  const port = server.address().port;

  const res = await fetch(`http://localhost:${port}/api/returns/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderNumber: 'ORD-2026-99999',
      eligibilityResult: { eligible: true, reviewRequired: false },
      resolution: 'exchange',
      category: 'fashion'
    })
  });

  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.ok(data.returnCode.startsWith('RTR-'));
  assert.strictEqual(data.status, 'Pengajuan dibuat');
  assert.strictEqual(data.resolution, 'exchange');
  assert.strictEqual(data.category, 'fashion');
  assert.ok(Array.isArray(data.packingInstructions));
  assert.strictEqual(data.shippingAddress.city, 'Semarang');

  server.close();
});

test('4. POST /api/returns/create fails for ineligible return application', async () => {
  const app = express();
  app.use(express.json());
  app.use('/api', returnRoute);

  const server = app.listen(0);
  const port = server.address().port;

  const res = await fetch(`http://localhost:${port}/api/returns/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderNumber: 'ORD-2026-99999',
      eligibilityResult: { eligible: false, reviewRequired: false },
      resolution: 'exchange',
      category: 'fashion'
    })
  });

  const data = await res.json();
  assert.strictEqual(res.status, 400);
  assert.strictEqual(data.error, true);
  assert.ok(data.message.includes('tidak layak retur'));

  server.close();
});
