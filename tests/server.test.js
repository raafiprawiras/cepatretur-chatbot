import test from 'node:test';
import assert from 'node:assert';
import app from '../src/app.js';

test('GET /api/health returns 200 OK with status, message, and geminiConfigured', async () => {
  const server = app.listen(0);
  const port = server.address().port;

  const res = await fetch(`http://localhost:${port}/api/health`);
  const data = await res.json();

  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.status, 'ok');
  assert.strictEqual(data.message, 'CepatRetur API is running');
  assert.strictEqual(typeof data.geminiConfigured, 'boolean');
  assert.ok(data.timestamp);

  server.close();
});

test('GET / serves index.html static file', async () => {
  const server = app.listen(0);
  const port = server.address().port;

  const res = await fetch(`http://localhost:${port}/`);
  const text = await res.text();

  assert.strictEqual(res.status, 200);
  assert.ok(text.includes('CepatRetur'));

  server.close();
});

test('GET /style.css and /script.js serve CSS and JS static files', async () => {
  const server = app.listen(0);
  const port = server.address().port;

  const cssRes = await fetch(`http://localhost:${port}/style.css`);
  const cssText = await cssRes.text();
  assert.strictEqual(cssRes.status, 200);
  assert.ok(cssText.includes('--primary-600'));

  const jsRes = await fetch(`http://localhost:${port}/script.js`);
  const jsText = await jsRes.text();
  assert.strictEqual(jsRes.status, 200);
  assert.ok(jsText.includes('CepatRetur'));

  server.close();
});

test('GET /api/nonexistent returns 404', async () => {
  const server = app.listen(0);
  const port = server.address().port;

  const res = await fetch(`http://localhost:${port}/api/unknown`);
  const data = await res.json();

  assert.strictEqual(res.status, 404);
  assert.strictEqual(data.error, true);
  assert.ok(data.message.includes('tidak ditemukan'));

  server.close();
});
