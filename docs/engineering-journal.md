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

---

## Sprint 1 – Frontend Foundation

### Learned

- Why application composition should be separated from feature modules.
- Benefits of centralized HTTP clients and environment configuration.
- How feature-oriented folder structures improve scalability.

### Decisions

- Adopted React Router as the routing solution.
- Centralized HTTP communication through a shared Axios client.
- Introduced application composition root under `src/app`.

### Future Improvements

- Add route guards for authenticated areas.
- Introduce global providers for authentication and theming.
- Add request interceptors for JWT and correlation IDs.