# aimed

An AI-powered medical exam review app for USMLE, NCLEX, and other licensing exams. Runs entirely in your browser — no backend, no account required.

## Features

- **Chat** — ask MedGemma anything; answers stream in real time
- **Flashcards** — AI-generated cards with SM-2 spaced repetition scheduling
- **Clinical Cases** — interactive case simulations with MedGemma as the attending
- **Settings** — configure your Ollama endpoint and model; view study stats

## Stack

| Layer | Tech |
|---|---|
| Framework | Vite + React 19 + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Routing | React Router v7 |
| LLM | Ollama (`medgemma` by default) |
| Persistence | `localStorage` only |

## Prerequisites

[Ollama](https://ollama.com) must be running on your machine with the MedGemma model pulled — even when using the deployed version, since the LLM runs locally:

```bash
ollama serve
ollama pull medgemma   # ~5 GB
```

## Getting started

```bash
pnpm install
pnpm dev               # http://localhost:5173
```

## Other commands

```bash
pnpm build             # production build
pnpm tsc --noEmit      # type check
pnpm lint              # eslint
```

## Configuration

The Ollama base URL (`http://localhost:11434`) and model name are configurable on the **Settings** page and are stored in `localStorage` under `aimed:settings`. No environment variables needed.
