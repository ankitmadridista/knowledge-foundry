# Engineering Principles

These principles guide every architectural and implementation decision in Knowledge Foundry.

---

## 1. Business logic is independent of infrastructure

Business rules must never depend on databases, HTTP, AI providers, or cloud services.

---

## 2. AI is a first-class capability

AI is not treated as a utility library. Prompt orchestration, evaluation, experimentation, and context engineering are core parts of the platform.

---

## 3. Prompts are source code

Prompt templates are version-controlled, reviewed through pull requests, and seeded into the database.

---

## 4. Context before generation

Every AI generation should use the most relevant context available before invoking a language model.

---

## 5. Evaluate before persisting

AI-generated content must be evaluated before it is stored or presented to users whenever practical.

---

## 6. Structured outputs over free-form text

Prefer JSON schemas and structured outputs to simplify validation and downstream processing.

---

## 7. Provider independence

The application must never depend on a specific LLM provider. Switching providers should require minimal code changes.

---

## 8. Observability by default

AI workflows should expose latency, token usage, cost, retries, and evaluation scores.

---

## 9. Security by design

Secrets are never committed to source control. Authentication and authorization are enforced at the API boundary.

---

## 10. Small, composable components

Favor composition, clear interfaces, and focused responsibilities over large, tightly coupled classes.