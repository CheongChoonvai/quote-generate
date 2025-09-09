import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb';

const app = express();
dotenv.config();
const PORT = process.env.PORT || 3001;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const MONGO_DB = process.env.MONGO_DB || 'quote_generator';
const MONGO_COLLECTION = process.env.MONGO_COLLECTION || 'history';

// Simple in-memory cache to avoid repeated Ollama calls for identical requests.
// Cache key: `${type}|${seed}`. TTL can be tuned via env GENERATE_CACHE_TTL_MS.
const genCache = new Map();
const CACHE_TTL_MS = parseInt(process.env.GENERATE_CACHE_TTL_MS || String(5 * 60 * 1000), 10);

// Configure CORS origins via env. FRONTEND_ORIGINS accepts a comma-separated
// list of allowed origins (e.g. "http://localhost:5173,http://example.com").
// You can also set FRONTEND_ORIGINS="*" to allow all origins (same as app.use(cors())).
const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

if (FRONTEND_ORIGINS.length === 1 && FRONTEND_ORIGINS[0] === '*') {
  // Keep default permissive behavior
  app.use(cors());
} else {
  app.use(cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (curl, server-side requests)
      if (!origin) return callback(null, true);
      if (FRONTEND_ORIGINS.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    }
  }));
}
app.use(express.json());

// Mongo client and helper
let mongoClient;
let historyCollection;

async function initMongo() {
  try {
    mongoClient = new MongoClient(MONGO_URL, { serverApi: ServerApiVersion.v1 });
    await mongoClient.connect();
    const db = mongoClient.db(MONGO_DB);
    historyCollection = db.collection(MONGO_COLLECTION);
    console.log('Connected to MongoDB:', MONGO_URL, 'DB:', MONGO_DB);
  } catch (err) {
    console.warn('MongoDB connection failed:', err.message || err);
  }
}

initMongo();


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Check Ollama status
app.get('/api/ollama/status', async (req, res) => {
  try {
    // Try a simple request to the Ollama server to confirm connectivity.
    const response = await axios.get(`${OLLAMA_URL}/api/tags`);
    // Log a concise debug line when healthy
    console.log('Ollama status OK:', { url: OLLAMA_URL });
    res.json({ status: 'connected', models: response.data.models });
  } catch (error) {
    // Try to surface useful debug info from axios error
    const details = error.response?.data || error.message || String(error);
    console.warn('Ollama status check failed:', details);
    res.status(503).json({ status: 'disconnected', error: details });
  }
});

// Generate quote using Ollama
app.post('/api/quotes/generate', async (req, res) => {
  const { seed, type } = req.body || {};
  
  try {
    // Check cache first - simpler cache key
    const cacheKey = `${type || 'Random'}|${seed || ''}`;
    const cached = genCache.get(cacheKey);
    if (cached && (Date.now() - cached.ts) < CACHE_TTL_MS) {
      console.log('Cache hit for', cacheKey);
      return res.json({ ...cached.value, source: 'cache', cached: true });
    }
    
    // Map simple type names to prompt adjectives or styles
    const typeMap = {
      Random: 'inspiring',
      Inspirational: 'inspirational',
      Motivational: 'motivational',
      Funny: 'funny',
      Philosophical: 'philosophical',
      Love: 'romantic',
      Sarcastic: 'sarcastic'
    };

    const style = typeMap[type] || 'inspiring';

    // Simplified prompt without requiring author - should be faster
    const prompt = seed
      ? `Give me one short ${style} quote about ${seed}.`
      : `Give me one short ${style} quote.`;

    console.log('Sending prompt to Ollama:', { prompt, model: process.env.OLLAMA_MODEL });

    const MODEL = process.env.OLLAMA_MODEL || 'deepseek-r1:1.5b';
    // Add temperature and max_tokens to make generations faster and more deterministic.
    const ollamaPayload = {
      model: MODEL,
      prompt,
      stream: false,
      // Optimized for fast generation with qwen
      temperature: parseFloat(process.env.OLLAMA_TEMPERATURE || '0.3'),
      max_tokens: parseInt(process.env.OLLAMA_MAX_TOKENS || '50', 10)
    };

  const ollamaResponse = await axios.post(`${OLLAMA_URL}/api/generate`, ollamaPayload);

    const generatedText = ollamaResponse.data?.response || ollamaResponse.data;
    console.log('Raw Ollama response:', { generatedText, status: ollamaResponse.status });

  // Normalize to string but keep thinking process
  let text = typeof generatedText === 'string' ? generatedText.trim() : String(generatedText);

    // Don't sanitize - keep the AI thinking process visible
    console.log('AI raw response with thinking:', text);

    // Parse quote and author from response - extract clean quote text
    let quoteText = 'AI Generated Quote';
    let author = 'Anonymous';
    let thinking = text; // Show the full raw AI response as "thinking"

    // Extract the actual quote part after thinking
    const thinkMatch = text.match(/<think[^>]*>[\s\S]*?<\/think>\s*([\s\S]*)/i);
    if (thinkMatch && thinkMatch[1].trim()) {
      let afterThinking = thinkMatch[1].trim();
      
      // Try to extract quote from various formats
      // Look for text in quotes
      const quotedMatch = afterThinking.match(/"([^"]+)"/);
      if (quotedMatch) {
        quoteText = quotedMatch[1].trim();
      } else {
        // Look for text in **bold**
        const boldMatch = afterThinking.match(/\*\*"?([^"*]+)"?\*\*/);
        if (boldMatch) {
          quoteText = boldMatch[1].trim();
        } else {
          // Use the first meaningful line
          const lines = afterThinking.split('\n').filter(line => line.trim());
          if (lines.length > 0) {
            quoteText = lines[0].replace(/^[^a-zA-Z]*/, '').trim();
          }
        }
      }
    } else {
      // If no thinking tags, use the raw text as the quote
      quoteText = text || 'No response from AI';
    }

    const result = {
      quote: quoteText,
      author,
      source: 'ollama',
      timestamp: new Date().toISOString(),
      raw: text,
      thinking: thinking // Always show the full AI response
    };

    // Store in cache
    try {
      genCache.set(cacheKey, { ts: Date.now(), value: result });
    } catch (e) {
      // ignore cache errors
    }

    res.json(result);
  } catch (error) {
    // When Ollama fails, return 503 so frontend knows generation failed.
    const details = error.response?.data || error.message || String(error);
    console.warn('Ollama generate error:', details);
    res.status(503).json({
      error: 'Ollama unavailable',
      details,
    });
  }
});

// History endpoints backed by MongoDB
app.get('/api/history', async (req, res) => {
  try {
    if (!historyCollection) return res.json([]);
    const items = await historyCollection.find().sort({ createdAt: -1 }).limit(100).toArray();
    res.json(items.map(i => ({ quote: i.quote, author: i.author, ts: i.ts || i.createdAt, _id: i._id })));
  } catch (err) {
    console.error('Get history error:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

app.post('/api/history', async (req, res) => {
  try {
    if (!historyCollection) return res.status(500).json({ error: 'DB not connected' });
    const { quote, author, ts } = req.body || {};
    const doc = { quote, author, ts: ts || Date.now(), createdAt: new Date() };
    const result = await historyCollection.insertOne(doc);
    res.json({ insertedId: result.insertedId, ...doc });
  } catch (err) {
    console.error('Insert history error:', err);
    res.status(500).json({ error: 'Failed to save history' });
  }
});

app.delete('/api/history', async (req, res) => {
  try {
    if (!historyCollection) return res.status(500).json({ error: 'DB not connected' });
    await historyCollection.deleteMany({});
    res.json({ ok: true });
  } catch (err) {
    console.error('Clear history error:', err);
    res.status(500).json({ error: 'Failed to clear history' });
  }
});


app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Ollama expected at: ${OLLAMA_URL}`);
});
