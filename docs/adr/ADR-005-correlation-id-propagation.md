# Architecture Decision Record (ADR)

## ADR-009: End-to-End Correlation ID Propagation

* **Status:** Accepted
* **Date:** 2026-08-25
* **Context:** API Requests, Background Processing, and AI Orchestration Pipelines
* **Decision Drivers:** 
  * End-to-end observability and log traceability.
  * UI/Client support capabilities (returning Trace IDs to users).
  * Strict adherence to Clean Architecture (no `HttpContext` in Application/Domain layers).
  * Support for non-HTTP workflows (Background Services).

---

## 1. Context and Problem Statement

Currently, the application processes complex AI workflows (e.g., Prompt execution, Lesson generation). When an error occurs or a performance bottleneck is identified, tracing the exact sequence of events across MediatR handlers, AI Platform policies, and database transactions is difficult. 

While ASP.NET Core provides a native `TraceIdentifier`, it is tightly coupled to `HttpContext`, making it unavailable to background workers or decoupled Application services. Furthermore, the UI needs a guaranteed way to read the Correlation ID from API responses (both success and error states) to attach to user support tickets.

## 2. Core Decision Drivers & Invariants

1. **INVARIANT 1 (Decoupling):** The Application, Domain, and AI Platform layers must never reference `Microsoft.AspNetCore.Http`.
2. **INVARIANT 2 (Ambient Context):** Developers should not have to manually pass a `correlationId` parameter through every method signature or MediatR record.
3. **INVARIANT 3 (Log Enrichment):** The Correlation ID must be automatically attached to every `ILogger` statement emitted during the request lifecycle.
4. **INVARIANT 4 (Client Visibility):** The Correlation ID must be returned in a standard HTTP response header (`X-Correlation-ID`) and explicitly exposed through CORS so browser clients can read it.
5. **INVARIANT 5 (Client Origination):** If a client provides a valid `X-Correlation-ID` in the request header, the backend must honor it. If missing, the backend must generate a new one.

---

## 3. Considered Options

* **Option 1: Pass `CorrelationId` explicitly in every MediatR Command/Query.**
  * *Pros:* Very explicit.
  * *Cons:* Pollutes the domain language and creates massive boilerplate. Rejected.
* **Option 2: Use ASP.NET Core `HttpContextAccessor`.**
  * *Pros:* Built-in.
  * *Cons:* Violates Clean Architecture. Background services (which have no HttpContext) would crash. Rejected.
* **Option 3: Scoped `ICorrelationIdContext` populated by Middleware / Job Runners. (Chosen)**
  * *Pros:* Completely decouples the concept of a Correlation ID from HTTP. The API layer populates it via Middleware. Background workers can populate it via Job metadata. All logs are automatically enriched.

---

## 4. Architectural Design & Data Flow

### The Abstraction (`KnowledgeFoundry.Application`)
We introduce `ICorrelationIdContext`. It acts as an ambient state container for the current execution scope (which maps 1:1 to an HTTP Request Scope or a Background Worker Scope).

### The Implementation (`KnowledgeFoundry.Infrastructure`)
We implement `CorrelationIdContext` using a scoped lifetime to hold the value for the duration of the request.

### The Gateway (`KnowledgeFoundry.Api`)
We introduce `CorrelationIdMiddleware` early in the ASP.NET Core pipeline.
1. Checks for `X-Correlation-ID` in the incoming request.
2. Generates a `Guid` if missing.
3. Sets the ID on the injected `ICorrelationIdContext`.
4. Opens an `ILogger.BeginScope` so all downstream logs automatically include `{"CorrelationId": "..."}`.
5. Attaches the `X-Correlation-ID` header to the outgoing HTTP response.

### Data Flow Diagram

```text
[UI / Client] 
   │ (Header: X-Correlation-ID: abc-123)
   ▼
[KnowledgeFoundry.Api : CorrelationIdMiddleware]
   │ 1. Read/Generate ID
   │ 2. context.Response.Headers.Append("X-Correlation-ID", id)
   │ 3. ICorrelationIdContext.SetCorrelationId(id)
   │ 4. using (_logger.BeginScope("{CorrelationId}", id)) {
   ▼
[KnowledgeFoundry.Application : MediatR Handlers]
   │ (Logs automatically enriched)
   │ Can inject ICorrelationIdContext if explicit ID is needed for 3rd party APIs
   ▼
[KnowledgeFoundry.Infrastructure / AIPlatform]
   │ (Logs automatically enriched)
   ▼
[KnowledgeFoundry.Api : GlobalExceptionHandler (If Error)]
   │ Attaches ICorrelationIdContext.CorrelationId to ProblemDetails response
   ▼
[UI / Client] 
   │ (Reads X-Correlation-ID from response headers or ProblemDetails)
   ```

## 5. Security & CORS Considerations
### To satisfy Invariant 4, the API Program.cs must be modified to expose the header to the browser:

```C#
policy.WithExposedHeaders("X-Correlation-ID")
```

Without this, modern browsers (Chrome/Edge/Firefox) will strip the header from the frontend JavaScript context during cross-origin (CORS) requests, breaking the UI's ability to show the ID to the user.