import express, { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const router = express.Router();

const DB_PATH = path.join(__dirname, 'db.json');

// Types
interface Quote {
  id: string;
  timestamp: string;
  data: {
    subscriber: Record<string, unknown>;
    project?: Record<string, unknown>;
    children?: Array<Record<string, unknown>>;
  };
  price: number;
}

interface Database {
  quotes: Quote[];
}

// Helper: Read database
async function readDB(): Promise<Database> {
  try {
    const content = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading database:', error);
    return { quotes: [] };
  }
}

// Helper: Write database
async function writeDB(db: Database): Promise<void> {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing database:', error);
    throw error;
  }
}

// Helper: Generate random price
function generatePrice(): number {
  return Math.floor(Math.random() * (200 - 50 + 1)) + 50;
}

/**
 * POST /api/login
 * Fake authentication - always succeeds
 */
router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  console.log(`[AUTH] Login attempt: ${username}`);

  // Always succeed (fake auth)
  res.json({
    success: true,
    user: {
      username,
      token: randomUUID(),
    },
  });
});

/**
 * POST /api/submit-quote
 * Submit a quote request and generate a quote ID
 */
router.post('/submit-quote', async (req: Request, res: Response) => {
  try {
    const { data } = req.body;

    if (!data || !data.subscriber) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quote data: subscriber is required',
      });
    }

    const quote: Quote = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      data,
      price: generatePrice(),
    };

    // Save to database
    const db = await readDB();
    db.quotes.push(quote);
    await writeDB(db);

    console.log(`[QUOTE] Created quote ${quote.id} for ${data.subscriber.nom} ${data.subscriber.prenom} - €${quote.price}/month`);

    res.json({
      success: true,
      quote: {
        id: quote.id,
        price: quote.price,
      },
    });
  } catch (error) {
    console.error('[ERROR] Failed to submit quote:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/quotes
 * Get all quotes
 */
router.get('/quotes', async (req: Request, res: Response) => {
  try {
    const db = await readDB();
    res.json({
      success: true,
      quotes: db.quotes,
      count: db.quotes.length,
    });
  } catch (error) {
    console.error('[ERROR] Failed to get quotes:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/quotes/:id
 * Get a specific quote by ID
 */
router.get('/quotes/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await readDB();
    const quote = db.quotes.find(q => q.id === id);

    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Quote not found',
      });
    }

    console.log(`[QUOTE] Retrieved quote ${id}`);

    res.json({
      success: true,
      quote,
    });
  } catch (error) {
    console.error('[ERROR] Failed to get quote:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});
