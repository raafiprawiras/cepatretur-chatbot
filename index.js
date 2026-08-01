import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import chatRoute from './routes/chatRoute.js';
import returnRoute from './routes/returnRoute.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Enable JSON parsing with 1MB size limit and syntax error handling
app.use(express.json({ limit: '1mb' }));
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: true,
      message: 'Format body request JSON tidak valid.'
    });
  }
  next(err);
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CepatRetur API',
    timestamp: new Date().toISOString()
  });
});

// Register API Routes
app.use('/api', chatRoute);
app.use('/api', returnRoute);

// Handle 404 for unmatched API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    error: true,
    message: `Endpoint API '${req.originalUrl}' tidak ditemukan.`
  });
});

// Global error handling middleware (No stack traces sent to client)
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: true,
    message: 'Terjadi kesalahan internal pada server.'
  });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🚀 CepatRetur Server is running on:`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`=================================`);
});
