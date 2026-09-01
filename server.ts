import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// High payload limits to comfortably support 3-4 min audio tracks, video clips, and HD images
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Storage directory for persistent gifts
const DATA_DIR = path.join(process.cwd(), '.data');
const GIFTS_FILE = path.join(DATA_DIR, 'gifts.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory store backed by disk
const giftsStore: Map<string, any> = new Map();

// Load initial stored gifts from disk if available
try {
  if (fs.existsSync(GIFTS_FILE)) {
    const raw = fs.readFileSync(GIFTS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      parsed.forEach((gift: any) => {
        if (gift && gift.id) {
          giftsStore.set(gift.id, gift);
          if (gift.shareCode) {
            giftsStore.set(gift.shareCode.toLowerCase(), gift);
          }
        }
      });
    }
  }
} catch (e) {
  console.error('Error reading gifts database:', e);
}

function saveGiftsToDisk() {
  try {
    const uniqueGifts = Array.from(
      new Map(Array.from(giftsStore.values()).map((g) => [g.id, g])).values()
    );
    fs.writeFileSync(GIFTS_FILE, JSON.stringify(uniqueGifts, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving gifts to disk:', e);
  }
}

// --- API ROUTES ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', giftsCount: giftsStore.size });
});

// Get all gifts
app.get('/api/gifts', (req, res) => {
  const uniqueGifts = Array.from(
    new Map(Array.from(giftsStore.values()).map((g) => [g.id, g])).values()
  );
  res.json({ success: true, gifts: uniqueGifts });
});

// Get single gift by ID or share code
app.get('/api/gifts/:id', (req, res) => {
  const idOrCode = req.params.id.trim();
  let gift = giftsStore.get(idOrCode) || giftsStore.get(idOrCode.toLowerCase());

  if (!gift) {
    // Case-insensitive search across all gifts
    for (const g of giftsStore.values()) {
      if (
        g.id?.toLowerCase() === idOrCode.toLowerCase() ||
        g.shareCode?.toLowerCase() === idOrCode.toLowerCase()
      ) {
        gift = g;
        break;
      }
    }
  }

  if (gift) {
    return res.json({ success: true, gift });
  }

  return res.status(404).json({ success: false, error: 'Gift not found' });
});

// Create or update a gift (supports 3-4 min audio, full video clips, HD photos)
app.post('/api/gifts', (req, res) => {
  try {
    const gift = req.body;
    if (!gift || !gift.id) {
      return res.status(400).json({ success: false, error: 'Invalid gift data' });
    }

    giftsStore.set(gift.id, gift);
    if (gift.shareCode) {
      giftsStore.set(gift.shareCode.toLowerCase(), gift);
    }

    saveGiftsToDisk();
    return res.json({ success: true, giftId: gift.id, shareCode: gift.shareCode });
  } catch (e: any) {
    console.error('Error saving gift:', e);
    return res.status(500).json({ success: false, error: e.message || 'Internal server error' });
  }
});

// Delete a gift
app.delete('/api/gifts/:id', (req, res) => {
  const idOrCode = req.params.id.trim();
  let foundGift = giftsStore.get(idOrCode) || giftsStore.get(idOrCode.toLowerCase());
  if (!foundGift) {
    for (const g of giftsStore.values()) {
      if (
        g.id?.toLowerCase() === idOrCode.toLowerCase() ||
        g.shareCode?.toLowerCase() === idOrCode.toLowerCase()
      ) {
        foundGift = g;
        break;
      }
    }
  }
  if (foundGift) {
    giftsStore.delete(foundGift.id);
    if (foundGift.shareCode) {
      giftsStore.delete(foundGift.shareCode.toLowerCase());
    }
    saveGiftsToDisk();
    return res.json({ success: true, message: 'Gift deleted' });
  }
  return res.status(404).json({ success: false, error: 'Gift not found' });
});

// --- VITE & STATIC SERVING ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Panther & Dino server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
