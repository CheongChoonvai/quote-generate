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
OLLAMA_MODEL=mc
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

## Environment variables (frontend & backend)

This project uses .env files for local development. Below are recommended variables and example files for Windows (`cmd.exe`). Place the backend file at `backend/.env` and the frontend file at `frontend/.env.local` (or `frontend/.env`).

### Backend (`backend/.env`)

Create `backend/.env` with these variables (example):

```
# Ollama server url (default used by project)
OLLAMA_URL=http://localhost:11434
# Optional: choose a model available to your Ollama instance
OLLAMA_MODEL=mc
# MongoDB connection
MONGO_URL=mongodb://localhost:27017
MONGO_DB=quote_generator
MONGO_COLLECTION=history
# Allowed frontend origins (comma-separated)
FRONTEND_ORIGINS=http://localhost:5173
# Backend port
PORT=3001
```

How to create and start the backend on Windows (cmd.exe):

```cmd
cd backend
npm install
rem create backend\.env and paste the variables above
npm run dev
```

Notes:
- You can also set these as environment variables directly through your OS or CI provider instead of a `.env` file.
- If Ollama is not available, the backend falls back to a sample quote endpoint (`/api/quotes/random`).

### Frontend (`frontend/.env.local` or `frontend/.env`)

Vite requires env variables that will be exposed to client code to be prefixed with `VITE_`. At minimum we recommend setting the backend API base URL so the frontend knows where to send requests.

Create `frontend/.env.local` with these variables (example):

```
VITE_API_BASE=http://localhost:3001/api
```

How to create and start the frontend on Windows (cmd.exe):

```cmd
cd frontend
npm install
rem create frontend\.env.local and add VITE_API_BASE as shown above
npm run dev
```

Using the variables in code:
- In the frontend you can access the API base with `import.meta.env.VITE_API_BASE`. For example the existing `src/api.js` should use that value to build requests: `const base = import.meta.env.VITE_API_BASE || '/api'`.

Restart the Vite dev server after changing `.env` files for changes to take effect.
