# ⚙️ PolkaDocs Backend

Layered NestJS backend service for PolkaDocs, handling document ingestion, vector storage, RAG pipelines, and observability.

## 🏗️ Architecture & Modules

The backend follows a layered monolithic architecture (`controllers -> services -> database`):

* `modules/auth` — JWT authentication, session rotation grace windows, and auth guards.
* `modules/users` — User profile and account management.
* `modules/documents` — File validation, document extraction (PDF, DOCX, TXT, MD), and chunking. Supported formats: `.pdf`, `.docx`, `.txt`, `.md`.
* `modules/llm` — Google Gemini SDK (`@google/genai`) & LangChain embeddings (`text-embedding-004`) and grounding.
* `modules/chat` — Conversational retrieval, session history, and streaming RAG execution.
* `modules/observability` — Health status (`/api/v1/health`) and Prometheus metrics (`/api/v1/metrics`).

## 🗄️ Database

* **Engine:** PostgreSQL 16 with `pgvector` extension for high-performance cosine similarity searches.
* **ORM:** TypeORM with automatic entity synchronization.

## 💻 Getting Started

### 1. Environment Configuration
Copy `.env.example` to `.env` or inject configuration via Doppler:
```bash
cp .env.example .env
```

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | API server listen port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgres://PolkaDocs:password@localhost:5432/PolkaDocs` |
| `JWT_ACCESS_SECRET` | Secret key for access token signing | *32+ char random string* |
| `JWT_REFRESH_SECRET` | Secret key for refresh token signing | *32+ char random string* |
| `GEMINI_API_KEY` | Google AI Studio API key | `AIzaSy...` |
| `CHAT_MODEL` | Gemini model for conversational generation | `gemini-2.0-flash` |
| `EMBEDDING_MODEL` | Gemini embedding model | `text-embedding-004` |
| `CHUNK_SIZE` | Document text chunk token/character size | `900` |
| `CHUNK_OVERLAP` | Overlap between adjacent chunks | `120` |
| `METRICS_TOKEN` | Bearer token for securing `/api/v1/metrics` | *Secure random hex token* |

### 2. Run Database & API
```bash
# Start PostgreSQL with pgvector via Docker Compose
docker-compose up -d db

# Install dependencies and start NestJS in watch mode
npm install
npm run start:dev
```
API runs locally at `http://localhost:3000/api/v1`.

### 3. Scripts
* `npm run start:dev` — Start development server with file watch.
* `npm run build` — Compile TypeScript to `dist/`.
* `npm run test` — Run unit tests.
* `npm run test:e2e` — Run end-to-end tests.

### 4. Observability Endpoints
* **Health Check:** `GET /api/v1/health` (Public, returns service status and uptime)
* **Prometheus Metrics:** `GET /api/v1/metrics` (Guarded; requires `Authorization: Bearer <METRICS_TOKEN>`)

## 🚀 Deployment

The backend is deployed to **Render** as a web service:
* **Production API:** [https://polkadocs.onrender.com](https://polkadocs.onrender.com)
* **Health Check:** [https://polkadocs.onrender.com/api/v1/health](https://polkadocs.onrender.com/api/v1/health)
