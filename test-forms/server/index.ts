import express from 'express';
import cors from 'cors';
import { router } from './routes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3100;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api', router);

// Start server
app.listen(PORT, () => {
  console.log(`✅ Test server running on http://localhost:${PORT}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, '../public')}`);
  console.log('');
  console.log('Available pages:');
  console.log(`  - http://localhost:${PORT}/index.html (Login)`);
  console.log(`  - http://localhost:${PORT}/home.html (Home)`);
  console.log(`  - http://localhost:${PORT}/form.html (Form)`);
  console.log(`  - http://localhost:${PORT}/quote.html (Quote)`);
  console.log('');
  console.log('API endpoints:');
  console.log(`  - POST http://localhost:${PORT}/api/login`);
  console.log(`  - POST http://localhost:${PORT}/api/submit-quote`);
  console.log(`  - GET  http://localhost:${PORT}/api/quotes`);
  console.log(`  - GET  http://localhost:${PORT}/api/quotes/:id`);
});
