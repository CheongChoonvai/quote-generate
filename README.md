## Quote Generator — Your Name Here

Author: Your Name Here (replace with your name)

## Brief description

A small web app that generates short quotes using a local model (Ollama) and displays them in a React frontend. The backend is an Express server that proxies generation requests to Ollama and saves quote history to MongoDB.

Technologies: React + Vite + Tailwind (frontend), Node.js + Express (backend), MongoDB (history), Ollama (local model inference).

## Setup (Windows - cmd.exe)

Prerequisites:
- Node.js + npm
- MongoDB (or a MongoDB connection URI)
- Ollama server (if you want model-based generation)

Open two separate terminals. In the first terminal start the backend:

```cmd
cd backend
npm install
rem Create a .env file in backend with the variables shown below or set them in your environment
npm run dev
```

In the second terminal start the frontend:

```cmd
cd frontend
npm install
npm run dev
```

Sample backend `.env` (create `backend/.env`):

```
# Ollama server url (default used by project)
OLLAMA_URL=http://localhost:11434
# Optional: choose a model available to your Ollama instance
OLLAMA_MODEL=deepseek-r1:1.5b
# MongoDB connection
MONGO_URL=mongodb://localhost:27017
MONGO_DB=quote_generator
MONGO_COLLECTION=history
# Allowed frontend origins (comma-separated)
FRONTEND_ORIGINS=http://localhost:5173
# Backend port
PORT=3001
```

Notes:
- If you don't run Ollama, the backend exposes a `/api/quotes/random` route that serves sample quotes.
- Use `npm start` in `backend` to run the production start script.

## How the pieces communicate (architecture)

- Frontend (`/frontend`) is a React app served by Vite (dev on http://localhost:5173). The UI calls the backend API endpoints to request quotes and to read/write history.
- Backend (`/backend`) is an Express server exposing endpoints such as:
  - `POST /api/quotes/generate` — forwards prompts to the Ollama server (`OLLAMA_URL`) to generate a quote.
  - `GET /api/quotes/random` — returns a random sample quote (fallback if Ollama unavailable).
  - `GET|POST|DELETE /api/history` — read, append, or clear saved quotes in MongoDB.
  - `GET /api/ollama/status` — health check for Ollama connectivity.
- The backend connects to MongoDB using `MONGO_URL` and stores history in the configured `MONGO_DB` / `MONGO_COLLECTION`.
- The backend communicates with Ollama over HTTP (default port 11434) using Axios.

In development, run the frontend and backend locally in separate terminals. The frontend will call the backend (CORS is configured in the backend; adjust `FRONTEND_ORIGINS` if needed).

## Quick try

- Visit the frontend dev server (usually http://localhost:5173) and generate a quote. The app will call `POST /api/quotes/generate` on the backend which in turn talks to Ollama.

## Replace

Replace the placeholder author name at the top of this file with your real name before publishing to a GitHub repository.
