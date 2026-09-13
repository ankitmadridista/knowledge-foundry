# ADR-010: Semantic RAG Upgrade via pgvector for Context Packs

**Status:** Proposed

**Date:** 13 September 2026

## Context
Currently, `ContextPacks` inject entire text sections directly into LLM prompts via the `{Context}` variable. As users add more data, this approach will exceed context window limits, increase API token usage, and degrade LLM instruction-following capabilities. The system requires a mechanism to dynamically retrieve and inject only the contextually relevant fragments of a Context Pack based on the user's current request. 

Furthermore, the system relies on free-tier LLM providers (Groq, Gemini, OpenRouter) and a Neon Postgres free-tier hosted database. The RAG architecture must operate within these constraints, utilizing compatible embedding models and supported PostgreSQL extensions without incurring infrastructure costs.

## Decision
We will upgrade the KnowledgeFoundry architecture to support Retrieval-Augmented Generation (RAG) using PostgreSQL's `pgvector` extension, which is natively supported by Neon's free tier.

### 1. Persistence & Database
*   Enable the `pgvector` extension in the Neon PostgreSQL database.
*   Integrate `Npgsql.EntityFrameworkCore.PostgreSQL.NetTopologySuite` and the EF Core `pgvector` package.
*   Standardize the vector dimension to `768`, which aligns with the most powerful free-tier embedding models (e.g., Google's `text-embedding-004` or OpenRouter's `nomic-ai/nomic-embed-text`).

### 2. Domain Hierarchy
*   Introduce a `ContextChunk` entity as an Owned Entity of `ContextSection`. 
*   Binding chunks to the section (rather than the aggregate root) preserves traceability, allowing the system to cite exactly which section of a Context Pack provided the retrieved knowledge.

### 3. Asynchronous Ingestion Pipeline
*   Introduce a background queue (`IContextIngestionQueue`) and a worker service (`ContextIngestionWorker`).
*   Upon publishing a Context Pack, the system will asynchronously split the text into overlapping semantic windows and call an `IEmbeddingService` to generate vector arrays. 

### 4. Resilience & UX Strategy
*   Because free-tier embedding models are subject to strict rate limits and timeouts, the asynchronous ingestion phase must be highly resilient.
*   The architecture will utilize front-end wrapper frameworks designed to intercept technical HTTP error messages from these various providers and models. This ensures that any background embedding failures are surfaced to the UI as clean, user-friendly messaging rather than raw API stack traces.

### 5. Execution Interception
*   Modify `ExecutePromptCommandHandler` and `LessonGenerationWorker`. 
*   When `{Context:Identifier}` is detected, the engine will embed the user's `{Topic}` and `{Audience}`, perform a Cosine Similarity search against the chunks in the Postgres database, and inject only the top-K highest-scoring chunks into the prompt.

## ⚖️ Technical Trade-offs

| Decision | Consequence | Justification |
| :--- | :--- | :--- |
| **Asynchronous Chunk Ingestion** | Context packs are not instantly available for generation upon clicking "Save" (requires a background processing phase). | Prevents UI blocking and HTTP timeouts caused by slow embedding API calls to free-tier providers. |
| **PostgreSQL with pgvector** | Ties the persistence layer tightly to Postgres, limiting database portability. | Neon natively supports pgvector on its free tier, eliminating the need to pay for or manage a separate standalone vector database (e.g., Pinecone). |
| **On-the-fly Topic Embedding** | Adds an initial API call (and associated latency) to the generation pipeline before the primary LLM executes. | Drastically reduces the prompt token size by injecting only top-K chunks, preventing context window limits and reducing free-tier API throttling. |
| **Front-end Error Wrappers** | Increases UI complexity by requiring custom interceptors for background embedding failures. | Free-tier models have aggressive rate limits. Graceful interception ensures users see actionable toast notifications instead of raw technical HTTP error messages. |

## Consequences
*   **Pros:** Massive reduction in LLM context bloat; enables future support for parsing large PDFs/Docs; zero infrastructure cost increase by leveraging Neon's native `pgvector` support.
*   **Cons:** Introduces complexity to the save flow; requires a secondary AI provider call (embedding) before the primary LLM execution; vector indexes require careful tuning in Postgres.