Quote Generator — Backend

Quick start

1. Copy `.env.example` to `.env` and edit values if needed.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` during development (requires `nodemon`) or `npm start` to run once.

Notes
- The server expects an Ollama server at `OLLAMA_URL` (or the default `http://localhost:11434`).
- MongoDB is optional; if not available the history endpoints will return empty or error responses.
