# Knowly V1: Module List

A document-based AI knowledge assistant. Users upload documents and chat with them; answers are grounded in the uploaded content (RAG) with source citations.

## Scope Summary

| Item | Decision |
|---|---|
| Architecture | Traditional monolith, layered architecture (controller, service, data access) |
| Type | RAG-based AI assistant (not an autonomous agent) |
| Frontend | React (PWA with offline support) |
| Backend | NestJS |
| LLM provider | Google Gemini |
| Vector store | PostgreSQL + pgvector |
| Infra | Docker, Doppler (secrets) |
| Monitoring | Prometheus + Grafana |
| Out of scope | Clean Architecture / DDD, microservices, modular monolith, Kubernetes, message brokers, multi-agent systems, LangGraph |

---

## 1. Auth Module

- Register
- Login
- Logout
- Refresh token
- Route protection (guards)

## 2. User Module

- Profile management
- Account settings

## 3. Document Module

- Upload document (PDF, DOCX, TXT, Markdown)
- File validation (type, size limit)
- Document list
- Document details
- Processing status (`uploaded`, `processing`, `ready`, `failed`)
- Delete document (also removes its chunks and vectors)

## 4. Ingestion Module

Lives inside the documents feature folder (`IngestionService`, `ChunkerService`, extractors).

- Text extraction per file type
- Text cleaning and normalization
- Chunking (size and overlap configurable)
- Embedding generation
- Store chunks and vectors in pgvector
- Re-process a document

## 5. Retrieval Module

Lives inside the documents feature folder (`Retriever` interface with pgvector and LangChain implementations).

- Embed the user query
- Similarity search (top-k)
- Scope search by user and selected documents
- Relevance threshold filtering
- Build context from retrieved chunks

## 6. Chat Module

- Create conversation
- Send message
- Streamed answer
- Conversation history
- Source citations (document and chunk references)
- Rename conversation
- Delete conversation
- Prompt builder and templates

## 7. LLM Module

The swappable AI layer. This is the only place with interfaces, because Gemini and LangChain both need to be pluggable for the Day 3 comparison. Chat and ingestion services depend on the interfaces, not on a vendor SDK.

- `LlmProvider` / `EmbeddingProvider` interfaces
- Gemini provider (raw SDK), built Day 1 and Day 2
- LangChain provider, built Day 3 against the same interfaces
- Provider selection via `AI_PROVIDER` env var
- Token usage tracking
- Error handling and retry

## 8. Observability Module

- Health check endpoint
- Prometheus metrics via `MetricsService`: request latency, LLM latency, token usage, retrieval time, error counts
- Grafana dashboards
- Structured logging (NestJS `Logger`)

## 9. Frontend (React PWA)

- Auth screens
- Document upload and management screen
- Chat screen with streaming and citations
- Conversation list
- Installable app (manifest + service worker)
- Offline access to cached chat history and document list

---

## Layered Architecture Map

| Layer | Contains |
|---|---|
| Controller | NestJS controllers, DTOs, guards, SSE streaming. HTTP only, no business logic |
| Service | Business logic and orchestration (`AuthService`, `DocumentsService`, `IngestionService`, `ChatService`, `ChunkerService`, `PromptBuilderService`) |
| Data access | TypeORM entities and repositories, raw SQL for pgvector search, file storage, text extractors, Gemini and LangChain providers |

Abstractions are added only when needed. Today that means three interfaces: `LlmProvider`, `EmbeddingProvider`, `Retriever`.

## Four-Day Plan

| Day | Focus | Modules |
|---|---|---|
| 1 | LLM fundamentals with Gemini SDK | LLM, Auth, User, project skeleton |
| 2 | RAG without LangChain | Document, Ingestion, Retrieval, Chat |
| 3 | LangChain + compare, infra | LLM (LangChain provider), Docker, Doppler |
| 4 | Frontend polish and monitoring | Frontend PWA, Observability |

## Deliberately Excluded from V1

- Clean Architecture, DDD, use-case classes, repository abstractions
- Microservices (not planned in V2 either)
- Modular monolith
- LangGraph and agents
- Kubernetes
- Message brokers
- Multi-agent systems