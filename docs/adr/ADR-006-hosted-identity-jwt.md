# ADR-006: Implementation of Hosted Identity and JWT Bearer Authentication

**Date:** 2026-08-28  
**Status:** Accepted  

## Context
Our AI platform currently operates without user authentication. This exposes upstream AI provider APIs to anonymous abuse, prevents us from implementing identity-aware Rate Limiting (ADR-005), and makes it impossible to introduce future "Premium" billing tiers or private data ownership (e.g., a user's private Context Packs or Lessons). 

Building a custom ASP.NET Core Identity system (self-hosted) would introduce:
1. **Cold-Start Latency:** Render's free tier spins down inactive APIs. A self-hosted login would force users to wait 10-15 seconds before seeing a login screen.
2. **Database Bloat:** Storing users, passwords, and sessions would rapidly consume Neon's free-tier storage limits.
3. **Development Overhead:** Building secure OAuth, MFA, and password-reset flows requires significant custom code.

## Decision
We will integrate **Clerk** as our Identity-as-a-Service (IDaaS) provider to handle authentication natively on the edge.

1. **Frontend (React/Vercel):** Will utilize Clerk components to handle all authentication flows (OAuth, Email/Password, MFA).
2. **Backend (.NET/Render):** Will be secured using the standard `Microsoft.AspNetCore.Authentication.JwtBearer` middleware.
3. **Token Validation:** The API will cryptographically validate incoming JWTs against Clerk's public JSON Web Key Set (JWKS) endpoint.
4. **Domain Expansion:** Domain entities (`Lesson`, `ContextPack`, `PromptTemplate`) will be updated to include an `OwnerId` (string) to enforce multi-tenant data isolation.
5. **Application Layer:** We will introduce an `ICurrentUserContext` abstraction to allow MediatR handlers to resolve the active user without coupling to HTTP concerns.

## Consequences

### Positive
* **Zero Backend Code for Complex Auth:** MFA, OAuth, and password resets are handled entirely by the provider.
* **Instant Login UI:** Authentication happens via the edge-cached frontend, masking the Render backend's cold-start time.
* **Unblocks Rate Limiting:** We can now safely implement Token Bucket rate limiting based on a verified User ID.
* **Database Optimization:** User management is offloaded, keeping the Postgres database focused strictly on domain entities.

### Negative / Mitigations
* **Third-Party Dependency:** We introduce a hard dependency on Clerk. (Mitigated by their high SLA and generous 10,000 MAU free tier).