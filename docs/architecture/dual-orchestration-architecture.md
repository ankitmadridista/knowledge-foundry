```mermaid
flowchart TD
    API["API Layer"] --> APP["Application Layer"]
    
    subgraph Dual Orchestration Domains
        direction LR
        BD["Business Domain"] 
        AIP["AI Platform"]
    end
    
    APP --> BD
    APP --> AIP
    
    BD --> INFRA["Infrastructure"]
    AIP --> INFRA
    
    %% Styling to match a dark/modern aesthetic
    classDef default fill:#18181b,stroke:#3f3f46,stroke-width:2px,color:#e4e4e7
    classDef domains fill:#312e81,stroke:#4f46e5,stroke-width:2px,color:#e0e7ff
    classDef infra fill:#064e3b,stroke:#059669,stroke-width:2px,color:#d1fae5
    
    class BD,AIP domains
    class INFRA infra
```

## Domain Responsibilities

| Architectural Layer         | Responsibilities                                                                                                                                                       |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **API & Application Layer** | Ingests requests and delegates them to the appropriate underlying orchestration domain.                                                                                |
| **Business Domain**         | Executes product workflows, authentication, authorization, user management, and core lesson generation requests.                                                       |
| **AI Platform**             | Manages cognitive workflows, including prompt orchestration, context injection, provider routing, structured output validation, reflection loops, and experimentation. |
| **Infrastructure**          | Provides raw execution capabilities for both domains without housing any business or AI decision-making logic.                                                         |

