import { useCallback, useRef, useState } from "react";
import { streamChat } from "@/lib/ollama";
import type { Message } from "@/types";

interface UseOllamaOptions {
	systemPrompt?: string;
	onToken?: (token: string) => void;
}

export function useOllama(options: UseOllamaOptions = {}) {
	const [isStreaming, setIsStreaming] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const abortRef = useRef<boolean>(false);

	const send = useCallback(
		async (
			messages: Message[],
			onUpdate: (partial: string) => void,
		): Promise<string> => {
			setIsStreaming(true);
			setError(null);
			abortRef.current = false;

			let full = "";
			try {
				const stream = streamChat(messages, options.systemPrompt);
				for await (const token of stream) {
					if (abortRef.current) break;
					full += token;
					options.onToken?.(token);
					onUpdate(full);
				}
			} catch (err) {
				const msg = err instanceof Error ? err.message : "Unknown error";
				setError(msg);
				throw err;
			} finally {
				setIsStreaming(false);
			}
			return full;
		},
		[options],
	);

	const stop = useCallback(() => {
		abortRef.current = true;
	}, []);

	return { send, stop, isStreaming, error };
}
