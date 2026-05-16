import type { AppSettings, Message, OllamaSettings } from "@/types";

const DEFAULT_SETTINGS: OllamaSettings = {
	baseUrl: "http://localhost:11434",
	model: "medgemma",
	temperature: 0.7,
};

export function getSettings(): OllamaSettings {
	try {
		const raw = localStorage.getItem("aimed:settings");
		if (!raw) return DEFAULT_SETTINGS;
		const parsed = JSON.parse(raw) as AppSettings;
		if (parsed.mode === "cloud" && parsed.cloud?.baseUrl) {
			return { ...parsed.cloud, baseUrl: "", proxyTarget: parsed.cloud.baseUrl };
		}
		return parsed.ollama ?? DEFAULT_SETTINGS;
	} catch {
		return DEFAULT_SETTINGS;
	}
}

interface OllamaChatChunk {
	message?: { content?: string };
	done?: boolean;
	error?: string;
}

export async function* streamChat(
	messages: Message[],
	systemPrompt?: string,
	settings?: OllamaSettings,
): AsyncGenerator<string, void, unknown> {
	const s = settings ?? getSettings();

	const ollamaMessages = [
		...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
		...messages.map((m) => ({ role: m.role, content: m.content })),
	];

	const headers: Record<string, string> = { "Content-Type": "application/json" };
	if (s.apiKey) headers.Authorization = `Bearer ${s.apiKey}`;
	if (s.proxyTarget) headers["X-Ollama-Target"] = s.proxyTarget;

	const chatUrl = s.proxyTarget ? "/api/chat" : `${s.baseUrl}/api/chat`;
	const displayUrl = s.proxyTarget ?? s.baseUrl;

	let response: Response;
	try {
		response = await fetch(chatUrl, {
			method: "POST",
			headers,
			body: JSON.stringify({
				model: s.model,
				messages: ollamaMessages,
				stream: true,
				think: false,
				options: { temperature: s.temperature },
			}),
		});
	} catch (err) {
		throw new Error(
			`Cannot reach Ollama at ${displayUrl}. Make sure Ollama is running and the model "${s.model}" is pulled.`,
			{ cause: err },
		);
	}

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Ollama error ${response.status}: ${text}`);
	}

	const reader = response.body?.getReader();
	if (!reader) throw new Error("No response body from Ollama");

	const decoder = new TextDecoder();
	let buffer = "";

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;

		buffer += decoder.decode(value, { stream: true });
		const lines = buffer.split("\n");
		buffer = lines.pop() ?? "";

		for (const line of lines) {
			if (!line.trim()) continue;
			try {
				const chunk = JSON.parse(line) as OllamaChatChunk;
				if (chunk.error) throw new Error(chunk.error);
				const token = chunk.message?.content;
				if (token) yield token;
				if (chunk.done) return;
			} catch (e) {
				if (e instanceof SyntaxError) continue;
				throw e;
			}
		}
	}
}

export async function checkConnection(baseUrl: string, apiKey?: string, proxyTarget?: string): Promise<boolean> {
	try {
		const headers: Record<string, string> = {};
		if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
		if (proxyTarget) headers["X-Ollama-Target"] = proxyTarget;
		const url = proxyTarget ? "/api/tags" : `${baseUrl}/api/tags`;
		const res = await fetch(url, { headers, signal: AbortSignal.timeout(4000) });
		return res.ok;
	} catch {
		return false;
	}
}

export async function listModels(baseUrl: string, apiKey?: string, proxyTarget?: string): Promise<string[]> {
	try {
		const headers: Record<string, string> = {};
		if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
		if (proxyTarget) headers["X-Ollama-Target"] = proxyTarget;
		const url = proxyTarget ? "/api/tags" : `${baseUrl}/api/tags`;
		const res = await fetch(url, { headers, signal: AbortSignal.timeout(4000) });
		if (!res.ok) return [];
		const data = (await res.json()) as { models?: { name: string }[] };
		return data.models?.map((m) => m.name) ?? [];
	} catch {
		return [];
	}
}
