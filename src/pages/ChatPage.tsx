import { LayoutList, Plus, Send, Square, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AiDisclaimer } from "@/components/AiDisclaimer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useOllama } from "@/hooks/useOllama";
import {
	deleteChatSession,
	generateId,
	getChatSessions,
	getStats,
	saveChatSession,
	updateStats,
} from "@/lib/storage";
import { cn } from "@/lib/utils";
import type { ChatSession, Message } from "@/types";

// Applied only to completed responses — strips closed thinking blocks only.
// Does NOT remove stray lone tags: removing the tag but not its content would
// expose raw thinking text to stripThinking's safety regex.
function stripThinkingFinal(content: string): string {
	// Standard <think>...</think>
	let result = content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
	// Closed <unusedN>...</unusedN> pairs
	result = result.replace(/<unused\d+>[\s\S]*?<\/unused\d+>/g, "").trim();
	// Gemma pattern: <unused94>thinking...<unused95>response
	result = result.replace(/<unused\d+>[\s\S]*?<unused\d+>/g, "").trim();
	return result;
}

// Applied during streaming — also strips unclosed/in-progress thinking blocks.
function stripThinking(content: string): string {
	let result = stripThinkingFinal(content);
	// Unclosed <think> — still streaming thinking
	result = result.replace(/<think>[\s\S]*$/, "").trim();
	// Unclosed <unusedN> — still streaming thinking (tag + all content after it)
	result = result.replace(/<unused\d+>[\s\S]*$/, "").trim();
	return result;
}

const SYSTEM_PROMPT = `You are MedGemma, a medical AI assistant helping students prepare for exams like USMLE, NCLEX, and other medical licensing exams.

You only answer questions written in English. If a message is not in English, respond with exactly: "Please write your question in English." — nothing more.

You only answer questions about medicine, health, and the biomedical sciences. If a question is unrelated to medicine, respond with exactly: "I can only help with medical topics. What would you like to study?" — nothing more.

When answering medical questions:
- Be accurate and evidence-based
- Use clear, structured explanations with bullet points or numbered lists when helpful
- For clinical questions, present differentials systematically
- Highlight key concepts that are commonly tested
- When appropriate, mention mnemonics or memory aids
- Flag if a question requires physician consultation for a real patient

Respond directly. Do not output any thinking, reasoning steps, or internal monologue.`;

function MarkdownContent({ content }: { content: string }) {
	return (
		<ReactMarkdown
			remarkPlugins={[remarkGfm]}
			components={{
				p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
				ul: ({ children }) => (
					<ul className="mb-2 ml-4 list-disc space-y-1 last:mb-0">{children}</ul>
				),
				ol: ({ children }) => (
					<ol className="mb-2 ml-4 list-decimal space-y-1 last:mb-0">{children}</ol>
				),
				li: ({ children }) => <li className="leading-relaxed">{children}</li>,
				strong: ({ children }) => (
					<strong className="font-semibold">{children}</strong>
				),
				em: ({ children }) => <em className="italic">{children}</em>,
				h1: ({ children }) => (
					<h1 className="mb-2 text-base font-bold">{children}</h1>
				),
				h2: ({ children }) => (
					<h2 className="mb-2 text-sm font-bold">{children}</h2>
				),
				h3: ({ children }) => (
					<h3 className="mb-1 text-sm font-semibold">{children}</h3>
				),
				code: ({ children, className }) => {
					const isBlock = className?.includes("language-");
					return isBlock ? (
						<code className="block rounded bg-black/10 px-3 py-2 font-mono text-xs my-2 whitespace-pre-wrap">
							{children}
						</code>
					) : (
						<code className="rounded bg-black/10 px-1 py-0.5 font-mono text-xs">
							{children}
						</code>
					);
				},
				blockquote: ({ children }) => (
					<blockquote className="border-l-2 border-current/30 pl-3 italic my-2">
						{children}
					</blockquote>
				),
				hr: () => <hr className="my-3 border-current/20" />,
			}}
		>
			{content}
		</ReactMarkdown>
	);
}

function MessageBubble({ message }: { message: Message }) {
	const isUser = message.role === "user";
	return (
		<div
			className={cn(
				"flex gap-3 px-4 py-3",
				isUser ? "justify-end" : "justify-start",
			)}
		>
			{!isUser && (
				<div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold mt-0.5">
					M
				</div>
			)}
			<div
				className={cn(
					"max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
					isUser
						? "bg-primary text-primary-foreground rounded-tr-sm"
						: "bg-muted text-foreground rounded-tl-sm",
				)}
			>
				{isUser ? (
					<p className="whitespace-pre-wrap">{message.content}</p>
				) : (
					<MarkdownContent content={message.content || "_No response_"} />
				)}
			</div>
			{isUser && (
				<div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-xs font-bold mt-0.5">
					You
				</div>
			)}
		</div>
	);
}

function StreamingBubble({ partial }: { partial: string }) {
	const visible = stripThinking(partial);
	return (
		<div className="flex gap-3 px-4 py-3 justify-start">
			<div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold mt-0.5">
				M
			</div>
			<div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-muted px-4 py-3 text-sm leading-relaxed">
				{visible ? (
					<MarkdownContent content={visible} />
				) : (
					<span className="text-xs italic text-muted-foreground animate-pulse">Thinking…</span>
				)}
			</div>
		</div>
	);
}

export function ChatPage() {
	const [sessions, setSessions] = useState<ChatSession[]>(() =>
		getChatSessions(),
	);
	const [activeId, setActiveId] = useState<string | null>(
		() => getChatSessions()[0]?.id ?? null,
	);
	const [sessionsOpen, setSessionsOpen] = useState(false);
	const [input, setInput] = useState("");
	const [streamingContent, setStreamingContent] = useState<string | null>(null);
	const bottomRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const { send, stop, isStreaming, error } = useOllama({
		systemPrompt: SYSTEM_PROMPT,
	});

	const activeSession = sessions.find((s) => s.id === activeId) ?? null;

	// biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message/stream changes; bottomRef is stable
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [activeSession?.messages, streamingContent]);

	function newSession() {
		const session: ChatSession = {
			id: generateId(),
			title: "New chat",
			messages: [],
			createdAt: Date.now(),
			updatedAt: Date.now(),
		};
		saveChatSession(session);
		setSessions(getChatSessions());
		setActiveId(session.id);
	}

	function removeSession(id: string) {
		deleteChatSession(id);
		const remaining = getChatSessions();
		setSessions(remaining);
		if (activeId === id) setActiveId(remaining[0]?.id ?? null);
	}

	async function submit() {
		const text = input.trim();
		if (!text || isStreaming || !activeSession) return;

		const userMsg: Message = {
			id: generateId(),
			role: "user",
			content: text,
			timestamp: Date.now(),
		};
		const updatedMessages = [...activeSession.messages, userMsg];

		const updated: ChatSession = {
			...activeSession,
			title:
				activeSession.messages.length === 0
					? text.slice(0, 60)
					: activeSession.title,
			messages: updatedMessages,
			updatedAt: Date.now(),
		};
		saveChatSession(updated);
		setSessions(getChatSessions());
		setInput("");
		setStreamingContent("");

		try {
			const full = await send(updatedMessages, (partial) =>
				setStreamingContent(partial),
			);
			const assistantMsg: Message = {
				id: generateId(),
				role: "assistant",
				content: stripThinkingFinal(full),
				timestamp: Date.now(),
			};
			const final: ChatSession = {
				...updated,
				messages: [...updatedMessages, assistantMsg],
				updatedAt: Date.now(),
			};
			saveChatSession(final);
			setSessions(getChatSessions());

			const stats = getStats();
			updateStats({
				totalChatMessages: stats.totalChatMessages + 1,
				lastStudied: Date.now(),
			});
		} finally {
			setStreamingContent(null);
		}
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			submit();
		}
	}

	const sessionsList = (onSelect?: () => void) => (
		<>
			<div className="flex items-center justify-between px-3 py-3 border-b">
				<span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
					Sessions
				</span>
				<Button
					size="icon"
					variant="ghost"
					className="h-6 w-6 hidden lg:flex"
					onClick={() => { newSession(); onSelect?.(); }}
				>
					<Plus size={14} />
				</Button>
			</div>
			<ScrollArea className="flex-1 min-h-0">
				<div className="flex flex-col gap-0.5 p-2">
					{sessions.length === 0 && (
						<p className="px-2 py-4 text-xs text-muted-foreground text-center">
							No sessions yet
						</p>
					)}
					{sessions.map((s) => (
						<div
							key={s.id}
							className={cn(
								"group flex w-full items-center rounded-md text-xs transition-colors",
								s.id === activeId
									? "bg-sidebar-accent text-sidebar-accent-foreground"
									: "text-sidebar-foreground hover:bg-sidebar-accent/50",
							)}
						>
							<button
								type="button"
								onClick={() => { setActiveId(s.id); onSelect?.(); }}
								className="flex-1 min-w-0 truncate text-left px-2 py-2 leading-relaxed"
							>
								{s.title}
							</button>
							<button
								type="button"
								onClick={() => removeSession(s.id)}
								className="flex shrink-0 items-center rounded p-1 mr-1 text-muted-foreground hover:text-destructive"
							>
								<Trash2 size={11} />
							</button>
						</div>
					))}
				</div>
			</ScrollArea>
		</>
	);

	return (
		<div className="flex h-full min-h-0">
			{/* Sessions panel — desktop only */}
			<div className="hidden lg:flex w-48 flex-col border-r bg-sidebar/50 min-h-0">
				{sessionsList()}
			</div>

			{/* Sessions sheet — mobile only */}
			<Sheet open={sessionsOpen} onOpenChange={setSessionsOpen}>
				<SheetContent side="left" className="p-0 w-64 flex flex-col">
					{sessionsList(() => setSessionsOpen(false))}
				</SheetContent>
			</Sheet>

			{/* Chat area */}
			<div className="flex flex-1 flex-col min-h-0">
				{/* Mobile sessions bar */}
				<div className="flex items-center justify-between border-b px-3 py-2 lg:hidden shrink-0">
					<Button
						variant="ghost"
						size="sm"
						className="gap-1.5 text-xs text-muted-foreground"
						onClick={() => setSessionsOpen(true)}
					>
						<LayoutList size={14} />
						{activeSession?.title ?? "Sessions"}
					</Button>
					<Button size="icon" variant="ghost" className="h-7 w-7" onClick={newSession}>
						<Plus size={14} />
					</Button>
				</div>
				<AiDisclaimer storageKey="aimed:chat-disclaimer-seen" />
				{activeSession ? (
					<>
						{/* Messages */}
						<ScrollArea className="flex-1 min-h-0">
							<div className="py-4">
								{activeSession.messages.length === 0 && !isStreaming && (
									<div className="flex flex-col items-center justify-center gap-3 pt-16 px-8 text-center">
										<div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary text-xl font-bold">
											M
										</div>
										<h2 className="font-semibold text-foreground">
											Ask MedGemma anything
										</h2>
										<p className="text-sm text-muted-foreground max-w-sm">
											Quiz yourself, get explanations, work through
											differentials, or discuss clinical concepts.
										</p>
										<div className="grid grid-cols-1 gap-2 mt-2 w-full max-w-sm">
											{[
												"Explain the pathophysiology of Type 2 diabetes",
												"What are the classic signs of Cushing's syndrome?",
												"Walk me through the management of septic shock",
											].map((prompt) => (
												<button
													key={prompt}
													type="button"
													onClick={() => {
														setInput(prompt);
														textareaRef.current?.focus();
													}}
													className="rounded-lg border px-3 py-2 text-left text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
												>
													{prompt}
												</button>
											))}
										</div>
									</div>
								)}
								{activeSession.messages.map((msg) => (
									<MessageBubble key={msg.id} message={msg} />
								))}
								{streamingContent !== null && (
									<StreamingBubble partial={streamingContent} />
								)}
								{error && (
									<div className="mx-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
										{error}
									</div>
								)}
								<div ref={bottomRef} />
							</div>
						</ScrollArea>

						{/* Input */}
						<div className="border-t p-4 shrink-0">
							<div className="flex items-end gap-2">
								<Textarea
									ref={textareaRef}
									value={input}
									onChange={(e) => setInput(e.target.value)}
									onKeyDown={handleKeyDown}
									placeholder="Ask a medical question… (Enter to send, Shift+Enter for newline)"
									className="min-h-13 max-h-48 resize-none text-sm"
									rows={2}
									disabled={isStreaming}
								/>
								{isStreaming ? (
									<Button
										size="icon"
										variant="outline"
										onClick={stop}
										className="shrink-0"
									>
										<Square size={16} />
									</Button>
								) : (
									<Button
										size="icon"
										onClick={submit}
										disabled={!input.trim()}
										className="shrink-0"
									>
										<Send size={16} />
									</Button>
								)}
							</div>
						</div>
					</>
				) : (
					<div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
						<p className="text-muted-foreground text-sm">No session selected</p>
						<Button onClick={newSession}>
							<Plus size={16} className="mr-2" />
							New chat
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
