# PolkaDocs V1: Module List

A document-based AI knowledge assistant. Users upload documents and chat with them; answers are grounded in the uploaded content (RAG) with source citations.

## Scope Summary

| Item | Decision |
|---|---|
| Architecture | Monolith, Clean Architecture from Day 1 |
| Type | RAG-based AI assistant (not an autonomous agent) |
| Frontend | React (PWA with offline support) |
| Backend | NestJS |
| LLM provider | Google Gemini |
| Vector store | PostgreSQL + pgvector |
| Infra | Docker, Doppler (secrets) |
| Monitoring | Prometheus + Grafana |
| Out of scope | Microservices, modular monolith, Kubernetes, message brokers, multi-agent systems, LangGraph |

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

- Text extraction per file type
- Text cleaning and normalization
- Chunking (size and overlap configurable)
- Embedding generation
- Store chunks and vectors in pgvector
- Re-process a document

## 5. Retrieval Module

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

## 7. LLM Module

The swappable AI layer. Business logic depends only on the port, never on a vendor SDK.

- `LLMPort` / `EmbeddingPort` interfaces (domain layer)
- Gemini adapter (raw SDK), built Day 1 and Day 2
- LangChain adapter, built Day 3 against the same ports
- Prompt builder and templates
- Token usage tracking
- Error handling and retry

## 8. Observability Module

- Health check endpoint
- Prometheus metrics: request latency, LLM latency, token usage, retrieval time, error counts
- Grafana dashboards
- Structured logging

## 9. Frontend (React PWA)

- Auth screens
- Document upload and management screen
- Chat screen with streaming and citations
- Conversation list
- Installable app (manifest + service worker)
- Offline access to cached chat history and document list

---

## Clean Architecture Layer Map

| Layer | Contains |
|---|---|
| Domain | Entities, value objects, ports (`LLMPort`, `EmbeddingPort`, repositories) |
| Application | Use cases (UploadDocument, IngestDocument, AskQuestion, etc.) |
| Infrastructure | Gemini adapter, LangChain adapter, pgvector repositories, file parsers |
| Presentation | NestJS controllers, DTOs, guards |

## Four-Day Plan

| Day | Focus | Modules |
|---|---|---|
| 1 | LLM fundamentals with Gemini SDK | LLM, Auth, User, project skeleton |
| 2 | RAG without LangChain | Document, Ingestion, Retrieval, Chat |
| 3 | LangChain + compare, infra | LLM (LangChain adapter), Docker, Doppler |
| 4 | Frontend polish and monitoring | Frontend PWA, Observability |

## Deliberately Excluded from V1

- Microservices
- LangGraph and agents
- Kubernetes
- Message brokers
- Multi-agent systems