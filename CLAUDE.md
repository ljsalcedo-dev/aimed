# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**aimed** is an AI-powered medical exam review web app (USMLE, NCLEX, licensing exams). It uses MedGemma 1.5 running locally via Ollama as the LLM backend, with all user data persisted in `localStorage`.

## Stack

- **Framework**: Vite + React 19 + TypeScript 6
- **Styling**: Tailwind CSS v4 + shadcn/ui (base-nova style, neutral palette)
- **Routing**: React Router v7
- **LLM**: Ollama REST API at `http://localhost:11434` — model `medgemma` (configurable in Settings)
- **Persistence**: `localStorage` only — no backend, no auth
- **Icons**: `lucide-react`

## Commands

```bash
pnpm install        # install deps
pnpm dev            # dev server → http://localhost:5173
pnpm build          # production build
pnpm tsc --noEmit   # type check
pnpm lint           # eslint
```

## Architecture

```
src/
├── types/index.ts          # All shared TypeScript interfaces
├── lib/
│   ├── ollama.ts           # Ollama streaming client (streamChat, checkConnection, listModels)
│   ├── storage.ts          # All localStorage read/write helpers + generateId()
│   └── sm2.ts              # SM-2 spaced repetition algorithm (applyReview, isDue, newCard)
├── hooks/
│   └── useOllama.ts        # React hook wrapping streamChat with isStreaming/error state
├── components/
│   ├── layout/             # Layout (sidebar + <Outlet>) and Sidebar nav
│   └── ui/                 # shadcn components (do not edit manually — use `pnpm dlx shadcn@latest add`)
└── pages/
    ├── ChatPage.tsx         # Streaming Q&A chat with session history
    ├── FlashcardsPage.tsx   # Library + SM-2 review mode + AI card generation
    ├── CasesPage.tsx        # Clinical case simulator (MedGemma as attending)
    └── SettingsPage.tsx     # Ollama URL/model config + study stats
```

## Key conventions

- **All AI calls are streaming** via the Ollama `/api/chat` endpoint. Use `streamChat()` from `lib/ollama.ts` directly for one-off generation, or `useOllama()` hook for React components that need `isStreaming`/`error` state.
- **localStorage keys** are all prefixed `aimed:` — see the `KEYS` const in `lib/storage.ts`.
- **SM-2 quality scale**: 1 = Again, 3 = Hard, 4 = Good, 5 = Easy (0–2 resets streak).
- **Adding shadcn components**: `pnpm dlx shadcn@latest add <name>` — components land in `src/components/ui/` (aliases in `components.json` use `src/` prefix explicitly).
- **Path alias**: `@/` resolves to `src/` (configured in both `vite.config.ts` and `tsconfig.app.json`).

## Ollama setup (for local dev)

```bash
ollama serve               # start Ollama
ollama pull medgemma       # pull the model (~5 GB)
```

The model name and base URL are configurable in the app's Settings page and stored in `localStorage` under `aimed:settings`.
