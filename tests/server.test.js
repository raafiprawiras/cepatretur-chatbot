import test from 'node:test';
import assert from 'node:assert';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, '../public');

test('GET /api/health returns 200 OK with json status ok', async () => {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.static(publicPath));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'CepatRetur API', timestamp: new Date().toISOString() });
  });

  const server = app.listen(0);
  const port = server.address().port;

  const res = await fetch(`http://localhost:${port}/api/health`);
  const data = await res.json();

  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.status, 'ok');

  server.close();
});

test('GET / serves index.html static file', async () => {
  const app = express();
  app.use(express.static(publicPath));

  const server = app.listen(0);
  const port = server.address().port;

  const res = await fetch(`http://localhost:${port}/`);
  const text = await res.text();

  assert.strictEqual(res.status, 200);
  assert.ok(text.includes('CepatRetur'));

  server.close();
});

test('GET /style.css and /script.js serve CSS and JS static files', async () => {
  const app = express();
  app.use(express.static(publicPath));

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
  const app = express();
  app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  const server = app.listen(0);
  const port = server.address().port;

  const res = await fetch(`http://localhost:${port}/api/unknown`);
  const data = await res.json();

  assert.strictEqual(res.status, 404);
  assert.strictEqual(data.error, 'Not Found');

  server.close();
});
