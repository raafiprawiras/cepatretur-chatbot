import test from 'node:test';
import assert from 'node:assert';
import express from 'express';
import returnRoute from '../routes/returnRoute.js';
import { checkReturnEligibility } from '../services/eligibilityService.js';

test('1. Scenario: 0-7 days, seal available, wrong size -> ELIGIBLE', () => {
  const res = checkReturnEligibility({
    orderNumber: 'ORD-12345',
    sealAvailable: true,
    daysRange: '0-7',
    reason: 'wrong_size'
  });
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.data.eligible, true);
  assert.strictEqual(res.data.reviewRequired, false);
  assert.strictEqual(res.data.decisionCode, 'ELIGIBLE');
});

test('2. Scenario: 8-14 days, damaged item -> REVIEW_REQUIRED', () => {
  const res = checkReturnEligibility({
    orderNumber: 'ORD-12345',
    sealAvailable: true,
    daysRange: '8-14',
    reason: 'damaged'
  });
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.data.eligible, true);
  assert.strictEqual(res.data.reviewRequired, true);
  assert.strictEqual(res.data.decisionCode, 'REVIEW_REQUIRED_EXTENDED_DAYS');
});

test('3. Scenario: >14 days -> EXPIRED (Not eligible)', () => {
  const res = checkReturnEligibility({
    orderNumber: 'ORD-12345',
    sealAvailable: true,
    daysRange: '>14',
    reason: 'wrong_size'
  });
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.data.eligible, false);
  assert.strictEqual(res.data.decisionCode, 'EXPIRED');
});

test('4. Scenario: No seal, changed mind -> NOT_ELIGIBLE', () => {
  const res = checkReturnEligibility({
    orderNumber: 'ORD-12345',
    sealAvailable: false,
    daysRange: '0-7',
    reason: 'changed_mind'
  });
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.data.eligible, false);
  assert.strictEqual(res.data.decisionCode, 'NOT_ELIGIBLE_SEAL_REMOVED');
});

test('5. Scenario: Not as described with damaged seal -> REVIEW_REQUIRED_DAMAGED_SEAL', () => {
  const res = checkReturnEligibility({
    orderNumber: 'ORD-12345',
    sealAvailable: false,
    daysRange: '0-7',
    reason: 'not_as_described'
  });
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.data.eligible, true);
  assert.strictEqual(res.data.reviewRequired, true);
  assert.strictEqual(res.data.decisionCode, 'REVIEW_REQUIRED_DAMAGED_SEAL');
});

test('6. Scenario: Unknown parameter value -> 400 Bad Request', async () => {
  const app = express();
  app.use(express.json());
  app.use('/api', returnRoute);

  const server = app.listen(0);
  const port = server.address().port;

  const res = await fetch(`http://localhost:${port}/api/returns/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderNumber: 'ORD-12345',
      sealAvailable: true,
      daysRange: '999', // Invalid daysRange
      reason: 'unknown_reason' // Invalid reason
    })
  });

  const data = await res.json();
  assert.strictEqual(res.status, 400);
  assert.strictEqual(data.error, true);
  assert.ok(data.message.includes('tidak dikenal'));

  server.close();
});
