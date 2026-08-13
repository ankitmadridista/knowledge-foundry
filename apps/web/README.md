# 🧠 Knowledge Foundry - Web UI

This is the frontend application for **Knowledge Foundry**, an enterprise-grade Prompt CMS. It provides the user interface for creating, managing, versioning, and executing LLM prompt templates.

## ✨ Frontend Features

- **Dynamic Variable UI:** Automatically generates multi-line text areas based on variables detected in the prompt templates (e.g., `{CustomerEmail}`).
- **Rich Markdown Rendering:** Uses `react-markdown` to safely and beautifully render the AI's markdown output (including headers, lists, and code blocks).
- **Template Management:** A clean, responsive dashboard to manage templates, publish new versions, and roll back to previous stable states.
- **Dark Mode Ready:** Fully styled with Tailwind CSS, supporting both light and dark themes.

## 🛠️ Tech Stack

- **Framework:** [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler:** [Vite](https://vitejs.dev/) (using SWC/Oxc for lightning-fast HMR)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Routing:** [React Router DOM](https://reactrouter.com/)
- **Markdown:** [React Markdown](https://github.com/remarkjs/react-markdown)

## 🚀 Local Development

### 1. Install Dependencies
Make sure you are in the `apps/web` directory, then run:
```bash
npm install
```

2. Configure Environment
If your .NET API is running on a specific port, ensure your frontend knows where to make API calls. (Note: If you have configured a proxy in vite.config.ts, you can skip this step).
Create a .env.local file in this directory:

```bash
VITE_API_BASE_URL=http://localhost:5000 # Replace with your .NET API port
```

3. Start the Development Server

```bash
npm run dev
```

🔧 Advanced Tooling & Linting (Vite Defaults)
This template provides a minimal setup to get React working in Vite with HMR.

React Compiler
The React Compiler is not enabled on this template by default because of its impact on dev & build performances. To add it, see the official documentation.

Expanding the ESLint configuration
If you are scaling this production application, we recommend updating the configuration to enable type-aware lint rules:

```js
// eslint.config.js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Remove tseslint.configs.recommended and replace with this:
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules:
      // tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules:
      // tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
```

For React-specific lint rules, you can also install and configure `eslint-plugin-react-x` and `eslint-plugin-react-dom`.
