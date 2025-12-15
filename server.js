/**
 * Simple Express Server for React SPA
 *
 * This server serves the built React app and handles client-side routing
 *
 * Installation:
 * npm install express
 *
 * Usage:
 * 1. Build the app: npm run build
 * 2. Start server: node server.js
 * 3. Visit: http://localhost:3000
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle all routes by serving index.html
// This is crucial for React Router to work properly
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${path.join(__dirname, 'dist')}`);
  console.log(`\n⚠️  Make sure you've built the app first: npm run build\n`);
});
