# 🧠 Knowledge Foundry

**Knowledge Foundry** is an enterprise-grade Prompt Content Management System (CMS) and AI Orchestration Gateway. 

In most modern applications, AI prompts are hardcoded directly into the source code. This creates a severe bottleneck: domain experts (marketers, lawyers, clinicians) cannot tune the AI's behavior, and developers are forced to wait for CI/CD pipelines to deploy new code just to tweak a single instruction. 

Knowledge Foundry solves this by completely decoupling AI logic from application code. It provides a platform to create, version, test, and publish LLM templates dynamically.

## ✨ Key Features

- **Dynamic Prompt Versioning:** Safely iterate on system contexts and user messages. Publish new versions instantly, or roll back to a previous version if the AI behaves unexpectedly in production.
- **Smart Variable Extraction:** The platform automatically parses variables (e.g., `{CustomerEmail}`, `{ClinicalNote}`) from your prompts and generates the required UI inputs on the fly for seamless testing.
- **LLM Agnostic Architecture:** Built with a heavily abstracted `AIPlatform` layer. Swapping from Llama 3 to OpenAI, Gemini, or Anthropic requires zero changes to the core domain logic.
- **Enterprise-Ready Backend:** Built on .NET 9 using strict Clean Architecture (Domain-Driven Design) principles, CQRS via MediatR, and strongly-typed Value Objects.
- **Lightning Fast AI:** Pre-configured to use Groq's LPU inference engine with Meta's `llama-3.3-70b-versatile` model for near-instant text generation.
- **Rich Markdown Rendering:** Native rendering of the AI's markdown output in the UI for a premium testing and reading experience.

## 🏗️ Architecture

The backend strictly adheres to **Clean Architecture**:
1. **Domain (`KnowledgeFoundry.Domain`):** Enterprise logic, Entities (`PromptTemplate`, `TemplateVersion`), and strongly-typed IDs. Zero external dependencies.
2. **Application (`KnowledgeFoundry.Application`):** Interfaces, CQRS Handlers (MediatR), and DTOs. Defines *what* the app does.
3. **Infrastructure (`KnowledgeFoundry.Infrastructure`):** EF Core, PostgreSQL, and data persistence.
4. **AI Platform (`KnowledgeFoundry.AIPlatform`):** An isolated project handling third-party LLM SDKs. Keeps the main application free of vendor lock-in.
5. **Web API (`KnowledgeFoundry.Api`):** The composition root and REST endpoints.

## 🛠️ Tech Stack

**Backend:**
- C# / .NET 9
- ASP.NET Core Web API
- Entity Framework Core 9 (PostgreSQL)
- MediatR (CQRS Pattern)
- OpenAI SDK (Configured for Groq endpoints)

**Frontend:**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- React Markdown

## 🚀 Getting Started

### Prerequisites
- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (v18+)
- A running instance of PostgreSQL
- [Groq API Key](https://console.groq.com/) (Free)

### Backend Setup

1. Navigate to the API directory:
   ```bash
   cd apps/api
   ```


    a. Set up your environment variables in src/KnowledgeFoundry.Api/appsettings.Development.json:

    ```json
    {
        "ConnectionStrings": {
            "DefaultConnection": "Host=localhost;Database=KnowledgeFoundry;Username=postgres;Password=yourpassword"
        },
        "Groq": {
            "ApiKey": "gsk_your_api_key_here",
            "Model": "llama-3.3-70b-versatile"
        }
    }
    ```

    b. Apply database migrations:

    ```Bash
    dotnet ef database update --project src/KnowledgeFoundry.Infrastructure --startup-project src/KnowledgeFoundry.Api
    ```

    Run the API:

    ```Bash
    dotnet run --project src/KnowledgeFoundry.Api
    ```

    Frontend Setup
    Navigate to the web directory:

    ```Bash
    cd apps/web
    ```

    Install dependencies:

    ```Bash
    npm install
    ```

    Run the development server:

    ```Bash
    npm run dev
    ```

    🌍 Production Deployment
    Render (Backend):
    ASP.NET Core automatically supports environment variable overrides using double underscores. In your Render dashboard, add the following variables:

    - ConnectionStrings__DefaultConnection : your_production_pg_connection_string
    - Groq__ApiKey : gsk_your_production_api_key
    - Groq__Model : llama-3.3-70b-versatile

    Vercel (Frontend):
    Simply connect your GitHub repository to Vercel. Ensure your Frontend's API base URL is pointed to your deployed Render backend URL.