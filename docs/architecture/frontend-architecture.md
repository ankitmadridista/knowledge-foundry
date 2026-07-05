# Frontend Architecture

The Knowledge Foundry frontend follows a feature-oriented architecture.

## app

Application composition root.

Responsible for:

- Routing
- Providers
- Global configuration
- Theme
- Error boundaries

## pages

Top-level route components.

Examples:

- Home
- Dashboard
- Login

Pages compose features but contain minimal business logic.

## features

Self-contained business capabilities.

Examples:

- Authentication
- Lesson Generation
- Prompt Library
- Experiment Runner

Each feature owns:

- Components
- Hooks
- API calls
- Types

## shared

Reusable modules that are independent of any feature.

Contains:

- API client
- Layouts
- Components
- Utilities
- Constants
- Types
- Hooks

## assets

Images, icons and static resources.

## styles

Global styling.