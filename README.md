# aimed

An AI-powered medical exam review app for USMLE, NCLEX, and other licensing exams. Runs entirely in your browser — no backend, no account, no data sent to the cloud.

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

---

## Local setup

### 1. Install prerequisites

- **Node.js** v20+ — [nodejs.org](https://nodejs.org)
- **pnpm** — `npm install -g pnpm`
- **Ollama** — [ollama.com/download](https://ollama.com/download)

### 2. Pull the model

MedGemma runs locally via Ollama. Pull it once (~5 GB):

```bash
ollama pull medgemma
```

### 3. Start Ollama

```bash
ollama serve
```

Ollama listens on `http://localhost:11434` by default. Keep this running while using the app.

### 4. Install dependencies and run the app

```bash
pnpm install
pnpm dev        # http://localhost:5173
```

Open `http://localhost:5173` in your browser. The app will connect to Ollama automatically.

---

## Configuration

The Ollama base URL and model name are configurable on the **Settings** page and stored in `localStorage` under `aimed:settings`. No environment variables needed.

| Setting | Default |
|---|---|
| Ollama URL | `http://localhost:11434` |
| Model | `medgemma` |

---

## Troubleshooting

**"Cannot connect to Ollama"**
- Make sure `ollama serve` is running.
- Check the URL on the Settings page matches where Ollama is listening.
- If you're running the app on a different port or via a deployed URL, Ollama still needs to be running locally — the LLM call goes from your browser directly to `localhost:11434`.

**CORS errors in the browser console**
- Ollama blocks cross-origin requests by default. Set the allowed origins environment variable before starting Ollama:
  ```bash
  OLLAMA_ORIGINS="*" ollama serve
  ```
  Or scope it to the app's origin: `OLLAMA_ORIGINS="http://localhost:5173"`.

**Model not found**
- Run `ollama list` to see what's pulled. If `medgemma` is missing, run `ollama pull medgemma`.
- You can also switch to any other Ollama model on the Settings page.

---

## Other commands

```bash
pnpm build          # production build
pnpm tsc --noEmit   # type check
pnpm lint           # eslint
```
