# ADR-011: Assessment Engine (Quiz Generation) Architecture

**Status:** Proposed  
**Date:** October 2026  

## 1. Context
Knowledge Foundry successfully generates and evaluates educational lessons. To complete the learning loop, we need a system to generate contextual assessments (quizzes) directly tied to those lessons. The system must produce structured, predictable data that can be persisted to a relational database, rendered in the UI, and audited by a human before being finalized.

## 2. Decision
We will introduce a new `Quiz` Aggregate Root that maps to an existing `Lesson` and relies on the AI Gateway's structured output capabilities to parse LLM responses directly into C# domain entities.

### Domain Model Architecture
*   **`Quiz` (Aggregate Root):** Tracks the lifecycle of the assessment.
    *   Properties: `Id`, `LessonId`, `Title`, `Status` (Draft, Published), `CreatedAt`.
*   **`Question` (Entity):** A child of the Quiz.
    *   Properties: `Id`, `QuizId`, `Text`, `Type` (MCQ, TrueFalse, Descriptive), `Explanation` (why the answer is correct).
*   **`Option` (Entity):** A child of the Question (for objective types).
    *   Properties: `Id`, `QuestionId`, `Text`, `IsCorrect` (boolean).

### Prompt Orchestration Updates
*   Extend the `PromptPurpose` enum to include `QuizGeneration = 3`.
*   Quiz templates will mandate `PromptCapability.StructuredOutput` to force the LLM to return a strict JSON array matching our C# schema.
*   The orchestrator will inject `{LessonContent}` into the prompt to strictly bound the AI to the taught syllabus, preventing hallucinated questions.

### Human-in-the-Loop Workflow
1. User requests a quiz (specifying count and type).
2. Background worker calls the AI Gateway, receives JSON, deserializes it, and saves the `Quiz` as a `Draft`.
3. Frontend queries the `Draft` quiz. The UI renders editable cards where the user can modify question text, flag correct options, or rewrite explanations.
4. User clicks "Publish," locking the quiz for actual test-taking use.

## 3. Consequences

**Positive:**
*   **High Component Reuse:** Perfectly reuses the existing `PromptTemplate` and AI Gateway infrastructure.
*   **Deterministic UI:** Because the LLM is constrained to structured JSON, the React frontend will never break trying to parse messy markdown lists.
*   **Quality Control:** The Draft/Published state machine guarantees no AI-hallucinated question reaches an end-user without human validation.

**Negative:**
*   **Deserialization Risks:** Even with structured output, LLMs occasionally truncate JSON if they hit token limits. The background worker will need a robust retry policy or partial-save handler if the JSON cuts off mid-question.