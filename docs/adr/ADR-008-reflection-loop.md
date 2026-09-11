# ADR-008: Multi-Agent Reflection Loop for AI Generation

> **Status:** ✅ Accepted  
> **Date:** `2026-09-11`  
> **Authors:** **Knowledge Foundry Team**

---

## 📌 Context

Knowledge Foundry utilizes external LLMs (e.g., Groq, Gemini) to generate educational lessons based on user prompts and dynamic Context Packs. 

Currently, generation is a **single-shot pipeline**: the system sends a prompt and accepts the first response as the final `LessonContent`. Single-shot generation is prone to:
- Hallucinations or straying from the provided Context Pack.
- Structural inconsistencies (e.g., ignoring formatting instructions).
- Missing critical concepts requested by the user.

Since our domain model already supports `CriticPromptTemplateId`, `CritiqueNotes`, and discrete generation statuses (`Drafting`, `Critiquing`, `Refining`), the system is structurally prepared for an autonomous self-correction mechanism.

### 🎯 Goal

Implement a **Formative Evaluation (Reflection) Loop** where multiple AI agents collaborate to produce high-quality output before it is presented to the user.

---

## 🧠 Decision

We will implement a synchronous, multi-agent reflection loop orchestrated by the .NET 9 Application layer. 

When a user selects a `CriticPromptTemplateId` during lesson creation, the MediatR command handler will execute a three-step LLM pipeline:

1. **Draft (Generator Agent):** The primary model generates an initial lesson draft.
2. **Critique (Critic Agent):** The draft is passed to a secondary evaluator model using the Critic Prompt Template. The critic analyzes the draft against the original context and outputs structured feedback (`CritiqueNotes`).
3. **Refine (Generator Agent):** The primary model receives its original draft alongside the `CritiqueNotes` and is instructed to rewrite and fix the identified flaws.

---

## 🏗️ Architecture & State Machine Flow

The orchestration logic maps directly to the existing `Lesson.cs` domain entity state machine.

```mermaid
sequenceDiagram
    participant API as 🚀 MediatR Handler
    participant DB as 🐘 PostgreSQL (EF Core)
    participant Gen as 🤖 Generator LLM
    participant Critic as 🧐 Critic LLM

    API->>DB: Lesson.CreatePending()
    
    rect rgb(24, 24, 27)
        Note right of API: 1. DRAFTING PHASE
        API->>Gen: Execute Primary Prompt + Context
        Gen-->>API: Draft Content
    end
    
    alt CriticTemplateId Exists
        rect rgb(24, 24, 27)
            Note right of API: 2. CRITIQUING PHASE
            API->>DB: Lesson.TransitionToCritiquing()
            API->>Critic: Execute Critic Prompt + Draft Content
            Critic-->>API: Critique Notes (Feedback)
        end
        
        rect rgb(24, 24, 27)
            Note right of API: 3. REFINING PHASE
            API->>DB: Lesson.TransitionToRefining(notes)
            API->>Gen: Execute Primary Prompt + Notes + Draft
            Gen-->>API: Final Polished Content
        end
    end
    
    API->>DB: Lesson.MarkAsCompleted(Final Content)
    API-->>User: 200 OK (Lesson Ready)

```


## ⚖️ Technical Trade-offs

| Decision | Consequence | Justification |
| :--- | :--- | :--- |
| **Synchronous Execution** | The HTTP request will take 2-3x longer to complete. | Acceptable technical debt. Establishes the core pipeline logic now. Will force a natural evolution to async processing (SignalR/Background Queues) in a future milestone. |
| **Multiple LLM Calls** | Token usage and API costs will increase significantly per lesson. | High-quality educational content requires rigorous validation. The Token Bucket rate limiter (ADR-007) is already in place to prevent cost overruns. |
| **In-Memory State** | The orchestration holds the Draft and Critique strings in memory during the request. | Keeps the `Lessons` database table clean by only persisting the final content and the meta-notes, rather than storing intermediate garbage drafts. |
| **Prompt vs. Model Routing** | Both Generator and Critic roles currently use the same underlying provider/model, differing only in the Prompt Template used. | Simplifies initial implementation. Future iterations can route Critic tasks to more capable (but slower/expensive) models like GPT-4o or Gemini 1.5 Pro. |

---

## 🖥️ UX/UI Impact

The React frontend will be updated to display the `CritiqueNotes` (if present) in an expandable "AI Reflection" accordion below the finished lesson. This exposes the multi-agent collaboration to the user, establishing high trust and showcasing the platform's advanced orchestration capabilities.