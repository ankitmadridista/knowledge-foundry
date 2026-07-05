# Frontend Request Flow

The frontend follows a layered request flow to keep UI components independent from infrastructure concerns.

```text
UI Component
      │
      ▼
Feature
      │
      ▼
Shared API Client
      │
      ▼
Backend API
```

## Principles

- Components never call Axios directly.
- Features encapsulate business capabilities.
- Shared infrastructure provides reusable HTTP clients and configuration.
- Environment-specific configuration is centralized in `shared/config`.

This separation allows authentication, logging, retries, correlation IDs, and request interceptors to be introduced without changing feature components.