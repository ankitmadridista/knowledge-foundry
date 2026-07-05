# Engineering Decision Log

---

## Sprint 0 — Project Foundation

### Goal

Establish a production-ready repository before implementing any features.

### Decisions

- Chose a monorepo instead of multiple repositories.
- Adopted Clean Architecture.
- Introduced an AI Platform as a first-class orchestration domain.
- Centralized NuGet package versions.
- Used Markdown for Context Packs.
- Prompts will be seeded from files into the database.

### Trade-offs

Markdown Context Packs

Pros
- Human readable
- Git versioned
- Easy review

Cons
- No semantic search
- Manual organization

Future
- Replace with hybrid RAG using pgvector.

### Lessons Learned

The default .NET templates are not compatible with Central Package Management without modification.

### Questions for Future Me

Should prompt versioning eventually become editable from the Admin UI?
