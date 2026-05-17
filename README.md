# aimed

An AI-powered medical exam review app for USMLE, NCLEX, and other licensing exams. Runs entirely in your browser — no backend, no account, no data sent to the cloud.

## Features

- **Chat** — ask medical questions; answers stream in real time with an AI disclaimer
- **Flashcards** — AI-generated cards with SM-2 spaced repetition scheduling and an onboarding guide
- **Clinical Cases** — interactive case simulations with the model acting as the attending
- **Settings** — switch between local and cloud mode, configure models, tune temperature, view study stats

## Stack

| Layer | Tech |
|---|---|
| Framework | Vite + React 19 + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Routing | React Router v7 |
| LLM | Ollama — local or cloud |
| Persistence | `localStorage` only |

---

## Modes

aimed supports two model backends, selectable on first launch and in Settings at any time.

### Local (Ollama)

Runs entirely on your device. No internet required for inference. Requires [Ollama](https://ollama.com/download) installed and a model pulled locally (~5 GB).

Best for: privacy, offline use, no API costs.

### Cloud (Ollama Cloud)

Runs models remotely via the [Ollama Cloud API](https://ollama.com/settings/api-keys). No local GPU needed. API keys are stored only in your browser's `localStorage`.

Free-tier models available: `gemma3:4b`, `gemma3:12b`, `llama3.2:3b`, `llama3.1:8b`, `mistral:7b`, `qwen2.5:7b`, `phi4`

Subscription models: `medgemma`, `medgemma1.5`, `gemma3:27b`, `llama3.1:70b`, `llama3.1:405b`

Best for: using the app without a local machine or GPU.

---

## Local setup

### 1. Install prerequisites

- **Node.js** v20+ — [nodejs.org](https://nodejs.org)
- **pnpm** — `npm install -g pnpm`
- **Ollama** — [ollama.com/download](https://ollama.com/download)

### 2. Pull the model

```bash
ollama pull medgemma   # ~5 GB
```

You can use any Ollama-compatible model. `medgemma` is the recommended default for medical exam review.

### 3. Start Ollama

```bash
ollama serve
```

Ollama listens on `http://localhost:11434` by default. Keep this running while using the app.

> **CORS note:** If you're accessing the app from a non-localhost origin, set the allowed origins before starting Ollama:
> ```bash
> OLLAMA_ORIGINS="*" ollama serve
> ```

### 4. Install dependencies and run

```bash
pnpm install
pnpm dev        # http://localhost:5173
```

On first launch, the setup wizard walks you through choosing local or cloud mode and verifying your connection before entering the app.

---

## Cloud setup

1. Get an API key at [ollama.com/settings/api-keys](https://ollama.com/settings/api-keys)
2. Open the app and choose **Cloud** on the setup screen (or switch in Settings)
3. Enter your API key, pick a model, and test the connection

---

## Configuration

All settings are on the **Settings** page and stored in `localStorage` under `aimed:settings`. No environment variables needed.

| Setting | Local default | Cloud default |
|---|---|---|
| Mode | `local` | `cloud` |
| Ollama URL | `http://localhost:11434` | — |
| Model | `medgemma` | `gemma3:4b` |
| Temperature | `0.7` | `0.7` |

In local mode, the model selector auto-populates with models you already have pulled. In cloud mode, it shows the full free/paid catalog.

---

## Other commands

```bash
pnpm build          # production build
pnpm tsc --noEmit   # type check
pnpm lint           # eslint
```

---

## Troubleshooting

**"Cannot connect to Ollama"**
- Confirm `ollama serve` is running.
- Check the URL on the Settings page matches where Ollama is listening (default `http://localhost:11434`).

**CORS errors in the browser console**
- Run `OLLAMA_ORIGINS="*" ollama serve` instead of plain `ollama serve`.

**Model not found**
- Run `ollama list` to see pulled models. Pull the model with `ollama pull <model>`.
- You can switch to any other model in Settings — the app does not require `medgemma` specifically.

**Cloud: "Cannot connect"**
- Verify your API key is correct and hasn't expired.
- Confirm the host field is set to `https://ollama.com` (the default).
