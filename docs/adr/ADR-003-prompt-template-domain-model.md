# ADR-003: Prompt Template Domain Model

- **Status:** Proposed
- **Date:** 2026-07-10
- **Authors:** Ankit Suravkar
- **Related ADRs:**
  - ADR-001: Project Architecture
  - ADR-002: Architecture Enforcement

---

# 1. Context

Knowledge Foundry treats Prompt Templates as **first-class business artifacts**, not implementation details.

Traditional applications frequently embed prompts directly within source code, configuration files, or provider-specific APIs. While this approach may be sufficient for small applications, it becomes increasingly difficult to manage as prompts evolve.

Prompt engineering is an iterative discipline. Prompts require experimentation, governance, review, comparison, auditing, controlled releases, and occasionally rollback to previous revisions.

As Knowledge Foundry evolves into an AI Engineering Platform, Prompt Templates become foundational assets supporting:

- AI workflows
- Evaluation pipelines
- Prompt experimentation
- Governance
- Auditability
- Reproducibility
- Future AI capabilities

The domain model must therefore represent prompts as business concepts rather than pieces of text.

---

# 2. Problem Statement

Traditional prompt management typically stores prompts as mutable strings.

This approach introduces significant limitations:

- Previous prompt revisions are lost.
- Rollback is difficult or impossible.
- AI experiments cannot be reproduced.
- Prompt evolution cannot be audited.
- Publishing workflows become difficult.
- Applications become tightly coupled to AI providers.
- Prompt history is not preserved.

Knowledge Foundry requires a domain model that supports versioning, governance, experimentation, reproducibility, and long-term evolution.

---

# 3. Ubiquitous Language

## Prompt Template

A Prompt Template is the long-lived business identity representing a reusable AI interaction.

Examples include:

- Lesson Generation
- Question Generation
- Reflection Assistant
- Content Summarization

A Prompt Template defines **what** an AI interaction is intended to accomplish.

It does **not** represent a specific implementation.

---

## Prompt Template Version

A Prompt Template Version is an immutable revision of a Prompt Template.

Each modification creates a new version.

Versions preserve the complete prompt definition at a specific point in time.

Historical versions are never modified.

---

## Prompt Message

A Prompt Message represents one message within an ordered AI conversation.

Each message contains:

- Role
- Content
- Order

Supported roles may include:

- System
- Developer
- User
- Assistant

Modeling prompts as ordered conversations reflects modern LLM APIs while remaining provider-independent.

---

## Purpose

Purpose is a controlled classification describing the business purpose of a Prompt Template.

Examples:

- Lesson Generation
- Evaluation
- Translation
- Reflection
- Summarization

Unlike Tags, Purpose is governed.

---

## Tag

A Tag is free-form metadata used for categorization and discovery.

Tags support searching, filtering, and organization.

---

## Capability

Capability describes the intended AI capability of a Prompt Template Version.

Examples include:

- General Chat
- Structured Output
- Reasoning
- Embedding

Capabilities describe AI intent rather than provider implementations.

---

## Publication

Publication is the process of making a Prompt Template Version available for activation.

---

## Activation

Activation is the process of promoting a published version into active use.

Only one version may be Active for a Prompt Template at any point in time.

---

## Rollback

Rollback creates a new version based on a previous version.

Historical versions remain immutable.

---

# 4. Decision

Knowledge Foundry models Prompt Templates using Domain-Driven Design.

The aggregate consists of:

## Aggregate Root

PromptTemplate

## Child Entity

PromptTemplateVersion

## Value Objects

### Identity

- TemplateIdentifier
- VersionNumber

### Semantic Values

- TemplateName
- TemplateDescription
- PromptMessage
- Tag

PromptTemplate owns the lifecycle and consistency of all PromptTemplateVersions.

PromptTemplateVersions become immutable once published.

---

# 5. Aggregate Design

```
PromptTemplate
│
├── TemplateIdentifier
├── TemplateName
├── TemplateDescription
├── Purpose
├── Tags
│
└── Versions
     │
     ├── PromptTemplateVersion
     │      ├── VersionNumber
     │      ├── Capability
     │      ├── Status
     │      └── PromptMessages
     │
     ├── PromptTemplateVersion
     │
     └── ...
```

PromptTemplate represents the long-lived business identity.

PromptTemplateVersions represent immutable historical revisions.

Versions have no lifecycle outside their owning PromptTemplate.

---

# 6. Why PromptTemplate is the Aggregate Root

PromptTemplate defines the aggregate consistency boundary.

It owns:

- Business identity
- Version collection
- Publication lifecycle
- Activation lifecycle
- Version sequencing

The aggregate enforces business rules including:

- Exactly one Active version.
- Sequential version numbering.
- Immutable version history.
- Valid lifecycle transitions.

These rules require visibility across all versions, making PromptTemplate the natural Aggregate Root.

---

# 7. Lifecycle

```
Draft
   │
Publish
   │
Published
   │
Activate
   │
Active
   │
Deprecate
   │
Deprecated
   │
Archive
   │
Archived
```

## Draft

A version currently under development.

Draft versions may be modified.

---

## Published

A version approved for release.

Published versions become immutable.

Publication does not automatically activate a version.

---

## Active

The version currently used by the platform.

Only one Active version is permitted.

Activating a version automatically deactivates the previously Active version.

---

## Deprecated

A version that is no longer recommended for active use but remains available for rollback and historical reference.

---

## Archived

A historical version retained for auditability and reproducibility.

Archived versions remain immutable.

---

# 8. Business Invariants

The aggregate enforces the following rules.

## Prompt Template

- Every PromptTemplate has a unique business identifier.
- Purpose is mandatory.
- Tags belong to the Template.
- A PromptTemplate may temporarily exist without versions during initial creation.

---

## Prompt Template Version

- Every Version belongs to exactly one PromptTemplate.
- Version numbers are unique within a PromptTemplate.
- Version numbers are immutable.
- Version numbers increase sequentially.
- Published versions cannot be modified.
- Every Version contains at least one PromptMessage.
- PromptMessages must have valid roles.
- PromptMessage content cannot be empty.
- Capability belongs to the Version.

---

## Lifecycle

- Exactly one Active version exists per PromptTemplate.
- Activating a version automatically deactivates the currently Active version.
- Rollback creates a new Version.
- Historical Versions are never modified.

---

# 9. Design Principles

## Business First

The domain model describes business concepts rather than implementation details.

---

## Immutability

Published Prompt Template Versions are immutable.

Changes create new versions rather than modifying existing history.

---

## Provider Independence

The domain models AI intent rather than AI vendors.

No domain object references provider-specific concepts.

---

## Traceability

Every Prompt Template Version can be reproduced, audited, and traced throughout its lifecycle.

---

## Evolution Without Mutation

Prompt evolution occurs through version creation instead of in-place modification.

---

# 10. Domain Events (Future)

Potential Domain Events include:

- PromptTemplateCreated
- PromptVersionCreated
- PromptVersionPublished
- PromptVersionActivated
- PromptVersionDeprecated
- PromptVersionArchived
- PromptVersionRolledBack

These events enable auditing, integrations, workflow automation, and future event-driven capabilities.

---

# 11. Rejected Alternatives

## Alternative A

Store prompts as editable text.

Rejected because:

- History is lost.
- Rollback is impossible.
- Auditing is limited.
- Experiments cannot be reproduced.

---

## Alternative B

Store Version directly on PromptTemplate.

Rejected because:

- Template identity changes over time.
- Version ownership becomes unclear.
- Publishing workflow becomes difficult.

---

## Alternative C

Treat every Prompt Version as an independent aggregate.

Rejected because:

- Aggregate invariants cannot be enforced.
- Versions lose business identity.
- Relationships become fragmented.
- Activation consistency becomes difficult.

---

# 12. Consequences

## Positive

- Immutable history
- Rollback support
- Auditability
- Reproducibility
- Experimentation
- Publishing workflow
- Provider independence
- Future extensibility

---

## Negative

- Additional domain complexity
- More domain objects
- Publishing workflow required
- Increased implementation effort

These trade-offs are accepted in exchange for long-term maintainability and governance.

---

# 13. Future Evolution

The Prompt Template model is intentionally designed for future expansion.

Potential capabilities include:

- Prompt Variables
- Prompt Composition
- Prompt Libraries
- Output Schemas
- Evaluation Criteria
- Evaluation Datasets
- Prompt Analytics
- Prompt Lineage
- Version Comparison
- Human Reviews
- Approval Workflows
- Experiments
- A/B Testing
- Execution History

These capabilities should be introduced without requiring fundamental changes to the aggregate.

---

# 14. Non-goals

This ADR intentionally does not define:

- Database schema
- EF Core mappings
- PostgreSQL implementation
- REST APIs
- GraphQL schema
- DTOs
- JSON serialization
- Prompt execution
- LLM provider routing
- Token accounting
- Cost optimization
- Provider-specific prompt syntax
- Gemini-specific features
- OpenAI-specific features
- Infrastructure concerns
- Caching strategy

These concerns will be addressed by future ADRs and implementation plans.

---

# 15. Review Checklist

Before this ADR is accepted, verify that:

- [ ] Ubiquitous language is consistent.
- [ ] Aggregate boundaries are clearly defined.
- [ ] Business invariants are explicit.
- [ ] Domain concepts remain provider-independent.
- [ ] No implementation details leak into the model.
- [ ] Future evolution has been considered.
- [ ] Rejected alternatives have been evaluated.

---

# Summary

Prompt Templates are treated as first-class business artifacts whose evolution is governed through immutable versioning rather than mutable state.

The aggregate root is PromptTemplate, which owns immutable PromptTemplateVersions and enforces lifecycle rules, version sequencing, and business invariants.

This model establishes a provider-independent, versioned, and extensible foundation for AI artifacts within Knowledge Foundry and serves as the architectural blueprint for future AI platform capabilities.