# ADR-001: A Clean Architecture implementation with a dedicated AI orchestration bounded context.

- **Status:** Accepted
- **Date:** 2026-06-30
- **Authors:** Knowledge Foundry Team

---

# Context

Knowledge Foundry is an AI-native educational platform rather than a traditional CRUD application.

The platform is expected to support:

- Multiple LLM providers
- Prompt versioning
- Context Packs
- Evaluation pipelines
- Reflection loops
- Experimentation
- AI workflow orchestration
- Future RAG capabilities

Treating AI as merely another infrastructure dependency would tightly couple business workflows to provider-specific implementations and make future evolution difficult.

---

# Decision

The solution adopts a **dual-orchestration architecture**.

Two orchestration domains exist:

1. Business Application
2. AI Platform

The Business Application is responsible for product workflows such as lesson generation requests, authentication, authorization, and user management.

The AI Platform is responsible for cognitive workflows including prompt orchestration, context injection, structured output validation, evaluation pipelines, experimentation, provider routing, and reflection loops.

Infrastructure provides execution capabilities to both orchestration domains without containing business or AI decision-making logic.

---

# Architecture

```

                   API
                    │
                    ▼
             Application Layer
            ┌────────┴────────┐
            ▼                 ▼
     Business Domain     AI Platform
            ▲                 ▲
            └────────┬────────┘
                     ▼
              Infrastructure

```

---

# Consequences

## Positive

- AI concerns remain isolated from business workflows.
- Providers can be replaced with minimal code changes.
- Prompt engineering becomes a first-class engineering discipline.
- Evaluation and experimentation are naturally extensible.
- The architecture supports future RAG capabilities without significant restructuring.

## Negative

- Additional projects and abstractions increase initial complexity.
- Developers must understand architectural boundaries before contributing.
- More interfaces are required than in a simple layered application.

---

# Alternatives Considered

## AI as Infrastructure

Treating AI as another infrastructure service similar to a database or HTTP client.

Rejected because orchestration logic, evaluation, experimentation, and prompt management are core product capabilities rather than implementation details.

---

## AI Inside Application Layer

Embedding AI orchestration directly inside application services.

Rejected because it mixes business workflows with cognitive workflows, reducing maintainability and limiting future extensibility.

---

# Future Evolution

Future milestones may introduce:

- Multi-agent workflows
- RAG with pgvector
- Model routing policies
- Cost-aware provider selection
- Human-in-the-loop evaluation
- AI observability dashboards

These additions should extend the AI Platform without affecting business workflows.