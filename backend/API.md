# Quote Generator API

This document explains the backend API implemented in `server.js`. It lists available endpoints, expected request/response shapes, environment variables, example requests, and troubleshooting notes.

## Purpose
The backend exposes a small REST API that:
- Checks basic health and connectivity to an Ollama model server
- Generates quotes using an Ollama model
- Returns a random sample quote
- Stores and retrieves a simple generation history in MongoDB

Assumptions:
- The code in `server.js` (provided with the project) is the primary implementation.
- `SAMPLE_QUOTES` referenced in the code is provided elsewhere in the project; if missing, `/api/quotes/random` will fail.

## Running the server
1. Install dependencies in `backend/` (if not already):

```bash
# from the backend folder
npm install
```

2. Set environment variables (see list below). Example (Windows cmd.exe):

```cmd
set PORT=3001
set OLLAMA_URL=http://localhost:11434
set OLLAMA_MODEL=mc
set MONGO_URL=mongodb://localhost:27017
set MONGO_DB=quote_generator
set MONGO_COLLECTION=history
```

3. Start the server:

```bash
node server.js
```

The server logs the bound port and expected Ollama URL at startup.

## Environment variables
- PORT: port to run the backend (default: `3001`).
- OLLAMA_URL: base URL of the Ollama server (default: `http://localhost:11434`).
- OLLAMA_MODEL: model id to pass to Ollama when generating (default: `mc`).
- MONGO_URL: connection string for MongoDB (default: `mongodb://localhost:27017`).
- MONGO_DB: database name (default: `quote_generator`).
- MONGO_COLLECTION: collection name for history (default: `history`).

Note: Mongo is optional — the server logs a warning if it cannot connect and history endpoints will either return empty arrays or an error depending on the endpoint.

## Common headers
All endpoints expect/return JSON (server sets CORS and `express.json()`):
- Requests with a JSON body must include `Content-Type: application/json`.
- Responses are JSON encoded.

## Endpoints

### GET /api/health
- Purpose: Basic health check.
- Request: none.
- Response: 200

```json
{ "status": "OK", "timestamp": "2025-09-09T...Z" }
```

### GET /api/ollama/status
- Purpose: Check connectivity to the Ollama server.
- Request: none.
- Success: 200, body contains `{ status: 'connected', models: ... }` where `models` is the raw response from Ollama's `/api/tags`.
- Failure: 503, body `{ status: 'disconnected', error: <details> }`.

### POST /api/quotes/generate
- Purpose: Generate a quote via Ollama model. The server sanitizes model output and extracts a quote + author.
- Request body (JSON):
  - seed (optional): string — seed/topic to bias the quote.
  - type (optional): string — one of the UI types like `Inspirational`, `Funny`, `Motivational`, etc. Server maps types to prompt adjectives.


Success response (200):
```json
{
  "quote": "The simplified example quote text.",
  "author": "Author Name",
  "source": "ollama",
  "timestamp": "2025-09-09T...Z",
  "raw": "Raw model output after sanitization"
}
```

Failure (Ollama unavailable): 503
```json
{ "error": "Ollama unavailable", "details": "<error details>" }
```

Notes:
- The server attempts to parse formats like: `"Quote text" - Author Name` or `Quote text - Author Name`.
- If no author is found it returns `author: 'Unknown'`.
- The server removes common model artifacts like `<think>...</think>`, other HTML-like tags, and parenthetical `(ollama)` mentions.

### GET /api/quotes/random
- Purpose: Return a random sample quote from an in-repo sample list (`SAMPLE_QUOTES`).
- Response: 200 JSON with fields `quote`, `author`, `source: 'sample'`, and `timestamp`.
- Note: If `SAMPLE_QUOTES` is undefined/empty the endpoint will fail.

### GET /api/history
- Purpose: Return stored history items from MongoDB (if connected).
- Response: 200 JSON array of entries. Each entry contains at least `{ quote, author, ts, _id }`.
- Behavior: If Mongo is not connected the endpoint returns an empty array (`[]`).

Example response:
```json
[
  { "quote": "Be...", "author": "Alice", "ts": 169..., "_id": "..." }
]
```

### POST /api/history
- Purpose: Insert a history item into MongoDB.
- Request body (JSON): `{ quote: string, author: string, ts?: number }`.
- Success: 200 with the inserted document and `insertedId` field.
- Failure: 500 with `{ error: 'Failed to save history' }` or 500 if DB not connected with `{ error: 'DB not connected' }`.

Example (Windows cmd.exe):
```cmd
curl -X POST -H "Content-Type: application/json" -d "{\"quote\":\"Be yourself.\",\"author\":\"Unknown\"}" http://localhost:3001/api/history
```

### DELETE /api/history
- Purpose: Clear history collection.
- Success: 200 `{ ok: true }`.
- Failure: 500 `{ error: 'Failed to clear history' }` or 500 if DB not connected.

## Error codes summary
- 200 OK — successful responses.
- 503 Service Unavailable — Ollama unreachable or generation failed.
- 500 Internal Server Error — Mongo failures or unexpected errors.

## Implementation notes (from `server.js`)
- Ollama requests are made via axios to `${OLLAMA_URL}/api/generate` and `${OLLAMA_URL}/api/tags`.
- The server maps UI `type` values to a short `style` string to include in the prompt.
- Output sanitization steps include removing `<think>` blocks, other angle-bracket tags, parenthetical `(ollama)` mentions, and collapsing whitespace.
- Parsing uses a few regex strategies to extract a quoted string and an author separated by `-` or `—`.

## Troubleshooting
- Ollama unreachable: check `OLLAMA_URL`, ensure the Ollama service is running and reachable from the machine running the backend. The `/api/ollama/status` endpoint helps debug connectivity.
- Mongo errors: server logs a warning at startup if Mongo fails to connect. History endpoints check whether the collection is present and return appropriate errors or empty arrays.
- Unexpected model output: the server tries basic sanitization and parsing but some model outputs may still produce an imperfect `quote` or `author`. Inspect the `raw` field returned by `/api/quotes/generate` for debugging.

## Quick test matrix (recommended)
- GET `/api/health` → 200
- GET `/api/ollama/status` → 200 (if Ollama running) or 503
- POST `/api/quotes/generate` with a simple seed → 200 or 503 (if Ollama fails)
- GET `/api/quotes/random` → 200 (if SAMPLE_QUOTES exists)
- GET/POST/DELETE `/api/history` → 200 (if Mongo connected) or 500/empty responses when disconnected

---

If you'd like, I can also:
- Add example requests in Postman collection format, or
- Add automated tests that call each endpoint using a small test runner.

