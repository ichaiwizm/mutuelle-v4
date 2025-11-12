import express from 'express';
import cors from 'cors';
import { router } from './routes.js';
import premiumRoutes from './products/premium-routes.js';
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

// Serve static files from public directory (Basic product)
app.use(express.static(path.join(__dirname, '../public')));

// Serve static files from products directory
app.use('/products', express.static(path.join(__dirname, '../products')));

// API routes
app.use('/api', router);
app.use('/api/premium', premiumRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`✅ Test server running on http://localhost:${PORT}`);
  console.log('');
  console.log('📦 BASIC PRODUCT:');
  console.log(`  - http://localhost:${PORT}/index.html (Login)`);
  console.log(`  - http://localhost:${PORT}/home.html (Home)`);
  console.log(`  - http://localhost:${PORT}/form.html (Form)`);
  console.log(`  - http://localhost:${PORT}/quote.html (Quote)`);
  console.log('');
  console.log('🚀 PREMIUM PRODUCT:');
  console.log(`  - http://localhost:${PORT}/products/premium/index.html (Redirects to login)`);
  console.log(`  - http://localhost:${PORT}/products/premium/login.html (Login with delays)`);
  console.log(`  - http://localhost:${PORT}/products/premium/home-wrapper.html (Home in iframe)`);
  console.log(`  - http://localhost:${PORT}/products/premium/form-wrapper.html (Form in iframe)`);
  console.log(`  - http://localhost:${PORT}/products/premium/quote-selection.html (Coverage grid)`);
  console.log(`  - http://localhost:${PORT}/products/premium/quote.html (Final quote)`);
  console.log('');
  console.log('🔌 API ENDPOINTS:');
  console.log('  Basic:');
  console.log(`    - POST http://localhost:${PORT}/api/login`);
  console.log(`    - POST http://localhost:${PORT}/api/submit-quote`);
  console.log(`    - GET  http://localhost:${PORT}/api/quotes`);
  console.log('  Premium:');
  console.log(`    - POST http://localhost:${PORT}/api/premium/quotes`);
  console.log(`    - GET  http://localhost:${PORT}/api/premium/quotes`);
  console.log(`    - GET  http://localhost:${PORT}/api/premium/quotes/:id`);
  console.log('');
});
