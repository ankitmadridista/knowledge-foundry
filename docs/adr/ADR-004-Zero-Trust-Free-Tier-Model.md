## ADR-004: Zero-Trust Free-Tier Model Verification and Execution Gate

* **Status:** Accepted / Signed Off
* **Date:** 2026-08-24
* **Context:** Multi-Model AI Orchestration Pipeline (`Groq`, `OpenRouter`, `Gemini`)
* **Decision Drivers:** Cost Security, Zero Financial Liability, Fail-Closed Architecture

---

## 1. Context and Problem Statement

The application orchestrates AI workflows across three external providers using their OpenAI-compatible endpoints:
* **Groq** (`https://api.groq.com/openai/v1/`)
* **OpenRouter** (`https://openrouter.ai/api/v1/`)
* **Google Gemini** (`https://generativelanguage.googleapis.com/v1beta/openai/`)

All infrastructure is currently deployed on free-tier services. Provider API keys reside solely as server-side environment variables and are never transmitted to the client.

### The Vulnerability
Previously, model selection and execution operated on an implicit trust model:
1. `AiModelDiscoveryService` queried provider catalogs and applied broad keyword blocklists and basic prompt pricing checks.
2. The frontend received a filtered list of models.
3. The frontend sent back an `AiProvider` enum and an arbitrary `model` string.
4. `MultiModelExecutionService` initialized `ChatClient(model, ...)` and called the provider API immediately without backend verification.

This design created an **Insecure Direct Object Reference (IDOR) / Execution Bypass**:
* A client could bypass the UI and send arbitrary, paid model IDs (e.g., `openai/gpt-4o`).
* OpenRouter checks only validated `pricing.prompt == "0"`, ignoring output tokens (`completion`), per-request fees (`request`), and image charges.
* Groq and Gemini models do not dynamically declare their free-tier status in model listing APIs. All models returned by their catalogs (unless blocked by keyword) were treated as executable, risking unexpected billing or quota exhaustion.

---

## 2. Core Decision Drivers & Security Invariants

The application must enforce a strict **Fail-Closed, Zero-Trust** security boundary:

1. **INVARIANT 1 (Pre-Execution Authorization):** No provider API call for chat completion may occur unless the target model is verified as free immediately prior to execution.
2. **INVARIANT 2 (Fail-Closed on Uncertainty):** `Unknown` status is strictly non-executable. Missing metadata, non-zero pricing, parse errors, or provider network timeouts must immediately reject the request.
3. **INVARIANT 3 (Zero Client Trust):** Client-provided provider/model identifiers are treated as untrusted user input.
4. **INVARIANT 4 (Discovery ≠ Authorization):** Dynamic discovery is an ephemeral UX aid, not an authorization boundary.
5. **INVARIANT 5 (Provider Policy Isolation):** Each provider's idiosyncratic pricing semantics must be encapsulated within dedicated provider policies.
6. **INVARIANT 6 (No Fallback):** The system will never silently fall back to an alternate model or provider if a requested model fails verification or execution.
7. **INVARIANT 7 (Bounded Cache Validity):** Cached verifications must expire using a short TTL and must be re-verified. Stale cached authorizations are non-executable.
8. **INVARIANT 8 (Fail-Closed Re-verification):** If a provider API is unreachable during re-verification, the result resolves to `Unknown` and execution is rejected.
9. **INVARIANT 9 (Secret Isolation):** Provider API keys must never leave server memory or leak into logs/responses.
10. **INVARIANT 10 (Zero Provider Traffic on Rejection):** Rejected requests must be halted before any downstream HTTP request to the provider's completion endpoint is made.

---

## 3. Considered Options

* **Option 1: Static Hardcoded Allowlist.**
  * *Pros:* Simple to implement.
  * *Cons:* Brittle. Free-tier models and aliases change frequently on OpenRouter and Groq, requiring constant application redeployments.
* **Option 2: Client-Side Enforcement (Status Quo).**
  * *Pros:* Zero backend overhead.
  * *Cons:* Insecure. Allows arbitrary paid model execution via direct API requests.
* **Option 3: Isolated Provider Policy Engine + Short-Lived Caching Verification Gate (Chosen).**
  * *Pros:* Enforces a Zero-Trust backend security perimeter. Encapsulates complex provider semantics. Leverages short-lived caching for performance without compromising safety.
  * *Cons:* Requires dedicated policy abstractions and structured test fixtures.

---

## 4. Architectural Design & Data Flow

### Sequence Diagram

```text
 Client                   Backend Controller          FreeModelVerificationService       Provider Policy / Cache         Provider Completion API
   │                              │                                │                                │                                │
   │─── Execute(Provider, Model) ─►│                               │                                │                                │
   │                              │─── VerifyModelAsync() ────────►│                                │                                │
   │                              │                                │─── Check In-Memory Cache ─────►│                                │
   │                              │                                │◄── Cache Hit / Miss ───────────│                                │
   │                              │                                │                                │                                │
   │                              │                                │ [If Cache Miss / Stale]        │                                │
   │                              │                                │─── EvaluatePolicyAsync() ─────►│                                │
   │                              │                                │◄── Free / NotFree / Unknown ───│                                │
   │                              │                                │                                │                                │ 
   │                              │◄── Return FreeModelResult ─────│                                │                                │
   │                              │                                                                                                  │
   │                              ├─── [If NotFree or Unknown] ──► Throw AiAuthorizationException (HTTP 403 / Terminate)             │
   │                              │                                                                                                  │
   │                              └─── [If Free] ───────────────────────────────────────────────────────────────────────────────────►│
   │                                                                                                                                 │─── CompleteChatAsync()
   │◄── Return Execution Result ─────────────────────────────────────────────────────────────────────────────────────────────────────│

```

---


## 5. Provider-Specific Verification Policies
* **1. OpenRouter (OpenRouterFreeModelPolicy)**
  * *Rule 1:* Target ID must explicitly end with :free or match the curated router alias openrouter/free.

  * *Rule 2:* (Multi-Dimensional Cost Gate): All pricing dimensions returned by OpenRouter metadata must be explicitly parsed as zero (prompt, completion, request, and image).

  * *Rule 3:* If the pricing object or any pricing field is missing, null, malformed, or non-numeric, the policy returns FreeModelResult.Unknown.

* **2. Groq (GroqFreeModelPolicy)**
Context: Groq's catalog endpoint lists developer models without an explicit boolean is_free flag.

  * *Rule 1:* Dynamically fetch the current model list from https://api.groq.com/openai/v1/models to ensure the model exists and is currently active.

  * *Rule 2:* Intersect active models with an official Groq Free-Plan compatibility policy (e.g., llama-3.1-8b-instant, mixtral-8x7b-32768).

  * *Rule 3:* Any model not positively verified by the policy returns FreeModelResult.Unknown.

* **3. Google Gemini (GeminiFreeModelPolicy)**
Context: Google's models endpoint returns experimental and preview models, some of which require paid quotas or billing accounts.

  * *Rule 1:* Dynamically verify model presence against the OpenAI-compatible Gemini endpoint.

  * *Rule 2:* Filter against authorized Gemini Free Tier variants (e.g., gemini-1.5-flash, gemini-1.5-flash-8b, gemini-1.5-pro).

  * *Rule 3:* Any unverified, paid, or specialized models (e.g., embedding, audio, robotics) return FreeModelResult.Unknown.


---


## 6. Verification Status & Cache Strategy
Strongly Typed Result
Instead of a binary bool, verification results use a 3-state domain representation:

```C#
public enum FreeModelResult
{
    Free = 1,
    NotFree = 2,
    Unknown = 3
}
```

* **Cache Rules**
  * *Implemented via IMemoryCache (scoped for single-instance deployments).*

  * *Cache Key: ```$"ai:free-model-verify:{provider}:{modelId}"```*

  * *Default TTL: Configurable via ```AiSafety:FreeModelVerificationTtlSeconds``` (Default: 300 seconds / 5 minutes).*

  * *Eviction / Expiry: Once expired, the next execution request triggers a background policy re-fetch. If the provider metadata endpoint fails, the cache entry is invalidated and execution fails closed.*


---

## 7. Target Project Structure


```
KnowledgeFoundry.AIPlatform/
├── Constants/
│   └── AiSafetyConstants.cs
├── Exceptions/
│   └── AiAuthorizationException.cs
├── Models/
│   ├── FreeModelResult.cs
│   └── ModelVerificationDetails.cs
├── Policies/
│   ├── IFreeModelPolicy.cs
│   ├── OpenRouterFreeModelPolicy.cs
│   ├── GroqFreeModelPolicy.cs
│   └── GeminiFreeModelPolicy.cs
├── Services/
│   ├── IFreeModelVerificationService.cs
│   ├── FreeModelVerificationService.cs
│   ├── AiModelDiscoveryService.cs        (Refactored: Uses Verification Gate)
│   └── MultiModelExecutionService.cs     (Refactored: Protected by Execution Gate)
└── Extensions/
    └── AiPlatformServiceCollectionExtensions.cs

```