# ADR-002: Versioned Prompt Templates

- **Status:** Accepted
- **Date:** 2026-07-10
- **Authors:** Ankit Suravkar

## Context

Prompt templates evolve over time as AI models, evaluation criteria, and business requirements change.

## Decision

Prompt templates will be immutable after publication.

Modifications create a new version instead of overwriting an existing one.

## Consequences

- Complete audit history
- Rollback support
- Experimentation
- Reproducibility
- Safer deployments