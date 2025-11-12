import { Router, Request, Response } from 'express';

const router = Router();

// Base de données en mémoire pour les quotes Premium
const quotes: any[] = [];

/**
 * POST /api/premium/quotes
 * Crée un nouveau quote Premium
 */
router.post('/quotes', (req: Request, res: Response) => {
  try {
    const quote = req.body;

    // Validation basique
    if (!quote.formData || !quote.selection || !quote.price) {
      return res.status(400).json({
        error: 'Missing required fields: formData, selection, price'
      });
    }

    // Ajouter timestamp si manquant
    if (!quote.timestamp) {
      quote.timestamp = new Date().toISOString();
    }

    // Générer un ID si manquant
    if (!quote.id) {
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      quote.id = `PREMIUM-${year}-${random}`;
    }

    // Sauvegarder
    quotes.push(quote);

    console.log(`[Premium API] Quote créé: ${quote.id} - ${quote.price} €`);

    res.status(201).json({
      success: true,
      quote: {
        id: quote.id,
        price: quote.price,
        timestamp: quote.timestamp
      }
    });
  } catch (error) {
    console.error('[Premium API] Erreur lors de la création du quote:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/premium/quotes
 * Récupère tous les quotes Premium
 */
router.get('/quotes', (req: Request, res: Response) => {
  res.json({
    success: true,
    count: quotes.length,
    quotes: quotes.map(q => ({
      id: q.id,
      price: q.price,
      timestamp: q.timestamp,
      formData: {
        nom: q.formData.nom,
        prenom: q.formData.prenom,
        email: q.formData.email
      }
    }))
  });
});

/**
 * GET /api/premium/quotes/:id
 * Récupère un quote spécifique
 */
router.get('/quotes/:id', (req: Request, res: Response) => {
  const quote = quotes.find(q => q.id === req.params.id);

  if (!quote) {
    return res.status(404).json({
      error: 'Quote not found'
    });
  }

  res.json({
    success: true,
    quote
  });
});

/**
 * DELETE /api/premium/quotes
 * Supprime tous les quotes (pour les tests)
 */
router.delete('/quotes', (req: Request, res: Response) => {
  const count = quotes.length;
  quotes.length = 0;

  console.log(`[Premium API] ${count} quotes supprimés`);

  res.json({
    success: true,
    deleted: count
  });
});

export default router;
