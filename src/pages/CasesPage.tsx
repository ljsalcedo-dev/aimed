import {
	Brain,
	Check,
	ChevronLeft,
	ChevronRight,
	CircleHelp,
	Loader2,
	Plus,
	Sparkles,
	Stethoscope,
	Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AiDisclaimer } from "@/components/AiDisclaimer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useOllama } from "@/hooks/useOllama";
import { streamChat } from "@/lib/ollama";
import {
	deleteCase,
	generateId,
	getCases,
	getStats,
	saveCase,
	updateStats,
} from "@/lib/storage";
import { cn } from "@/lib/utils";
import type { ClinicalCase, Message } from "@/types";

const GUIDE_KEY = "aimed:cases-guide-seen";

const SPECIALTIES = [
	"General Medicine",
	"Cardiology",
	"Pulmonology",
	"Gastroenterology",
	"Neurology",
	"Nephrology",
	"Endocrinology",
	"Hematology",
	"Infectious Disease",
	"Rheumatology",
	"Psychiatry",
	"Pediatrics",
	"Obstetrics & Gynecology",
	"Surgery",
	"Emergency Medicine",
];

const SYSTEM_PROMPT = `You are an experienced attending physician presenting a clinical case to a medical student or resident for exam preparation.

You only respond to messages written in English. If a message is not in English, respond with exactly: "Please write your question in English." — nothing more.

You ONLY engage with questions and statements related to the clinical case or medical topics. If the student asks something unrelated to medicine or the case, stay in character and redirect them back to the clinical scenario.

Your role:
- Present clinical information in a realistic, structured manner
- Answer questions about the case (labs, imaging, history) when asked
- Guide the student through the diagnostic and management process
- Provide teaching points at appropriate moments
- When the student reaches a correct diagnosis or management plan, confirm it and elaborate on key learning points
- Keep responses focused and exam-oriented (USMLE/NCLEX style)

Always stay in character as the attending physician. When presenting initial case details, use a format like:
"A [age]-year-old [gender] presents with..."

Encourage the student to ask for specific information (vitals, labs, imaging) rather than giving everything upfront.

Respond directly. Do not output any thinking, reasoning steps, or internal monologue.`;

// ── Case conversation ─────────────────────────────────────────────────────────

function CaseConversation({
	clinicalCase,
	onBack,
}: {
	clinicalCase: ClinicalCase;
	onBack: () => void;
}) {
	const [currentCase, setCurrentCase] = useState(clinicalCase);
	const [input, setInput] = useState("");
	const [streamingContent, setStreamingContent] = useState<string | null>(null);
	const bottomRef = useRef<HTMLDivElement>(null);
	const wasStreamingRef = useRef(false);

	// Scroll only when streaming starts or ends — not on every token — so the
	// user can freely scroll back to review previous messages mid-response.
	useEffect(() => {
		const isStreaming = streamingContent !== null;
		const streamingJustStarted = isStreaming && !wasStreamingRef.current;
		wasStreamingRef.current = isStreaming;
		if (!isStreaming || streamingJustStarted) {
			bottomRef.current?.scrollIntoView({ behavior: "smooth" });
		}
	}, [streamingContent]);

	const { send, isStreaming, error } = useOllama({
		systemPrompt: SYSTEM_PROMPT,
	});

	async function submit() {
		const text = input.trim();
		if (!text || isStreaming) return;

		const userMsg: Message = {
			id: generateId(),
			role: "user",
			content: text,
			timestamp: Date.now(),
		};
		const updatedMessages = [...currentCase.messages, userMsg];

		const updated: ClinicalCase = {
			...currentCase,
			messages: updatedMessages,
			updatedAt: Date.now(),
		};
		setCurrentCase(updated);
		saveCase(updated);
		setInput("");
		setStreamingContent("");

		try {
			const full = await send(updatedMessages, (partial) =>
				setStreamingContent(partial),
			);
			const assistantMsg: Message = {
				id: generateId(),
				role: "assistant",
				content: full,
				timestamp: Date.now(),
			};
			const final: ClinicalCase = {
				...updated,
				messages: [...updatedMessages, assistantMsg],
				updatedAt: Date.now(),
			};
			setCurrentCase(final);
			saveCase(final);
		} finally {
			setStreamingContent(null);
		}
	}

	function markComplete() {
		const completed: ClinicalCase = {
			...currentCase,
			status: "completed",
			updatedAt: Date.now(),
		};
		setCurrentCase(completed);
		saveCase(completed);
		const stats = getStats();
		updateStats({
			totalCasesCompleted: stats.totalCasesCompleted + 1,
			lastStudied: Date.now(),
		});
	}

	function reopen() {
		const reopened: ClinicalCase = {
			...currentCase,
			status: "active",
			updatedAt: Date.now(),
		};
		setCurrentCase(reopened);
		saveCase(reopened);
	}

	return (
		<div className="flex flex-1 flex-col overflow-hidden">
			{/* Header */}
			<div className="flex items-center gap-3 border-b px-4 py-3">
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8"
					onClick={onBack}
				>
					<ChevronLeft size={16} />
				</Button>
				<div className="flex-1 min-w-0">
					<p className="font-medium text-sm truncate">{currentCase.title}</p>
					<div className="flex items-center gap-2 mt-0.5">
						<Badge variant="secondary" className="text-xs">
							{currentCase.category}
						</Badge>
						<Badge
							variant={
								currentCase.status === "completed" ? "default" : "secondary"
							}
							className="text-xs"
						>
							{currentCase.status}
						</Badge>
					</div>
				</div>
				{currentCase.status === "completed" ? (
					<Button
						variant="ghost"
						size="sm"
						onClick={reopen}
						className="text-muted-foreground"
					>
						Reopen
					</Button>
				) : (
					<Button variant="outline" size="sm" onClick={markComplete}>
						<Check size={13} className="mr-1" />
						Mark done
					</Button>
				)}
			</div>

			{/* Messages */}
			<div className="flex-1 overflow-y-auto min-h-0">
				<div className="py-4 px-4 flex flex-col gap-3">
					{/* Initial presentation */}
					<div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 px-4 py-4 text-sm leading-relaxed">
						<p className="font-medium text-blue-800 dark:text-blue-300 mb-2 text-xs uppercase tracking-wide">
							Clinical Presentation
						</p>
						<p className="text-foreground whitespace-pre-wrap">
							{currentCase.initialPresentation}
						</p>
					</div>

					{/* Conversation */}
					{currentCase.messages.map((msg) => (
						<div
							key={msg.id}
							className={cn(
								"max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
								msg.role === "user"
									? "ml-auto bg-primary text-primary-foreground rounded-tr-sm"
									: "bg-muted text-foreground rounded-tl-sm",
							)}
						>
							{msg.role === "user" ? (
								<p className="whitespace-pre-wrap">{msg.content}</p>
							) : (
								<ReactMarkdown
									remarkPlugins={[remarkGfm]}
									components={{
										p: ({ children }) => (
											<p className="mb-2 last:mb-0">{children}</p>
										),
										ul: ({ children }) => (
											<ul className="list-disc pl-4 mb-2 space-y-0.5">
												{children}
											</ul>
										),
										ol: ({ children }) => (
											<ol className="list-decimal pl-4 mb-2 space-y-0.5">
												{children}
											</ol>
										),
										li: ({ children }) => <li>{children}</li>,
										strong: ({ children }) => (
											<strong className="font-semibold">{children}</strong>
										),
										em: ({ children }) => (
											<em className="italic">{children}</em>
										),
										h1: ({ children }) => (
											<p className="font-semibold mb-1">{children}</p>
										),
										h2: ({ children }) => (
											<p className="font-semibold mb-1">{children}</p>
										),
										h3: ({ children }) => (
											<p className="font-medium mb-1">{children}</p>
										),
										code: ({ children }) => (
											<code className="rounded bg-black/10 dark:bg-white/10 px-1 font-mono text-xs">
												{children}
											</code>
										),
									}}
								>
									{msg.content}
								</ReactMarkdown>
							)}
						</div>
					))}

					{/* Streaming */}
					{streamingContent !== null && (
						<div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-muted px-4 py-3 text-sm leading-relaxed">
							{streamingContent ? (
								<ReactMarkdown
									remarkPlugins={[remarkGfm]}
									components={{
										p: ({ children }) => (
											<p className="mb-2 last:mb-0">{children}</p>
										),
										ul: ({ children }) => (
											<ul className="list-disc pl-4 mb-2 space-y-0.5">
												{children}
											</ul>
										),
										ol: ({ children }) => (
											<ol className="list-decimal pl-4 mb-2 space-y-0.5">
												{children}
											</ol>
										),
										li: ({ children }) => <li>{children}</li>,
										strong: ({ children }) => (
											<strong className="font-semibold">{children}</strong>
										),
										em: ({ children }) => (
											<em className="italic">{children}</em>
										),
										h1: ({ children }) => (
											<p className="font-semibold mb-1">{children}</p>
										),
										h2: ({ children }) => (
											<p className="font-semibold mb-1">{children}</p>
										),
										h3: ({ children }) => (
											<p className="font-medium mb-1">{children}</p>
										),
										code: ({ children }) => (
											<code className="rounded bg-black/10 dark:bg-white/10 px-1 font-mono text-xs">
												{children}
											</code>
										),
									}}
								>
									{streamingContent}
								</ReactMarkdown>
							) : (
								<div className="flex gap-1 items-center h-5">
									<Skeleton className="h-2 w-2 rounded-full animate-bounce" />
									<Skeleton className="h-2 w-2 rounded-full animate-bounce [animation-delay:150ms]" />
									<Skeleton className="h-2 w-2 rounded-full animate-bounce [animation-delay:300ms]" />
								</div>
							)}
						</div>
					)}

					{error && (
						<div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
							{error}
						</div>
					)}

					<div ref={bottomRef} />
				</div>
			</div>

			{/* Input */}
			{currentCase.status !== "completed" && (
				<div className="border-t p-4">
					<div className="flex gap-2">
						<Textarea
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									submit();
								}
							}}
							placeholder="Ask about vitals, labs, imaging, or give your assessment… (Enter to send)"
							className="min-h-12 max-h-36 resize-none text-sm"
							rows={2}
							disabled={isStreaming}
						/>
						<Button
							size="icon"
							onClick={submit}
							disabled={!input.trim() || isStreaming}
							className="shrink-0 self-end"
						>
							{isStreaming ? (
								<Loader2 size={16} className="animate-spin" />
							) : (
								<Stethoscope size={16} />
							)}
						</Button>
					</div>
					<p className="text-xs text-muted-foreground mt-2">
						Suggested: ask for vitals · request labs · order imaging · give
						differential · state management plan
					</p>
				</div>
			)}
		</div>
	);
}

// ── Create case dialog ────────────────────────────────────────────────────────

function CreateCaseDialog({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	const [specialty, setSpecialty] = useState("General Medicine");
	const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
		"medium",
	);
	const [customPrompt, setCustomPrompt] = useState("");
	const [generating, setGenerating] = useState(false);
	const [preview, setPreview] = useState("");

	async function generate() {
		setGenerating(true);
		setPreview("");

		const userMessage = customPrompt.trim()
			? `Create a ${difficulty} ${specialty} clinical case about: ${customPrompt}`
			: `Create a ${difficulty} ${specialty} clinical case suitable for USMLE/NCLEX preparation`;

		const prompt = `${userMessage}

Format your response as:
TITLE: [short descriptive title]
PRESENTATION: [The opening clinical presentation — describe the patient's age, sex, chief complaint, and 2-3 key initial findings. Do NOT reveal the diagnosis. End with an implicit invitation to gather more information.]

Requirements:
- Keep the presentation to 3-5 sentences. Make it realistic and exam-appropriate.
- Use varied patient demographics: randomize age (range 18–85), sex, and relevant social/occupational background. Do NOT default to a middle-aged or elderly male.`;

		try {
			let full = "";
			const messages = [
				{
					id: "gen",
					role: "user" as const,
					content: prompt,
					timestamp: Date.now(),
				},
			];
			const existingTitles = getCases()
				.map((c) => `- ${c.title}`)
				.join("\n");
			const existingBlock = existingTitles
				? `\n\nThe following cases already exist — do NOT generate a case on the same topic or diagnosis:\n${existingTitles}`
				: "";
			const systemPrompt = `You are a medical education expert creating high-yield clinical cases for licensing exam preparation. Respond directly. Do not output any thinking, reasoning steps, or internal monologue.${existingBlock}`;
			const stream = streamChat(messages, systemPrompt);
			for await (const token of stream) {
				full += token;
				setPreview(full);
			}

			// Parse and save while still under generating=true so a second click is blocked
			const titleMatch = full.match(/TITLE:\s*(.+?)(?:\n|$)/);
			const presentationMatch = full.match(
				/PRESENTATION:\s*([\s\S]+?)(?:\n\n|$)/,
			);

			if (titleMatch && presentationMatch) {
				const title = titleMatch[1].trim();
				const initialPresentation = presentationMatch[1].trim();
				const existing = getCases();
				const alreadyExists = existing.some(
					(c) =>
						c.title === title && c.initialPresentation === initialPresentation,
				);
				if (!alreadyExists) {
					const clinicalCase: ClinicalCase = {
						id: generateId(),
						title,
						category: specialty,
						difficulty,
						initialPresentation,
						messages: [],
						status: "active",
						createdAt: Date.now(),
						updatedAt: Date.now(),
					};
					saveCase(clinicalCase);
				}
				setPreview("");
				setCustomPrompt("");
				onClose();
			}
		} finally {
			setGenerating(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>Generate clinical case</DialogTitle>
				</DialogHeader>
				<div className="flex flex-col gap-4">
					<div className="grid grid-cols-2 gap-3">
						<div className="flex flex-col gap-1.5">
							<Label>Specialty</Label>
							<Select
								value={specialty}
								onValueChange={(v) => {
									if (v) setSpecialty(v);
								}}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{SPECIALTIES.map((s) => (
										<SelectItem key={s} value={s}>
											{s}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex flex-col gap-1.5">
							<Label>Difficulty</Label>
							<Select
								value={difficulty}
								onValueChange={(v) => setDifficulty(v as typeof difficulty)}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="easy">Easy</SelectItem>
									<SelectItem value="medium">Medium</SelectItem>
									<SelectItem value="hard">Hard</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="flex flex-col gap-1.5">
						<Label>Focus (optional)</Label>
						<Input
							placeholder="e.g. chest pain, hyponatremia, altered mental status"
							value={customPrompt}
							onChange={(e) => setCustomPrompt(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && !generating && generate()}
						/>
					</div>

					{preview && (
						<div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
							{preview}
						</div>
					)}

					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={onClose} disabled={generating}>
							Cancel
						</Button>
						<Button onClick={generate} disabled={generating}>
							{generating ? (
								<Loader2 size={14} className="animate-spin mr-2" />
							) : (
								<Sparkles size={14} className="mr-2" />
							)}
							Generate
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

// ── Clinical case guide ───────────────────────────────────────────────────────

function ClinicalCaseGuide({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	const [step, setStep] = useState(0);

	const steps = [
		{
			icon: <Sparkles size={26} />,
			iconBg: "bg-blue-500/10 text-blue-500",
			title: "Generate a case",
			content: (
				<div className="space-y-3">
					<p className="text-sm text-muted-foreground">
						Each case is created on demand by your AI model — no two are the
						same.
					</p>
					<div className="grid gap-2">
						{[
							{
								label: "Specialty",
								desc: "Target a system you're weak on — Cardiology, Neuro, OB/GYN, and more.",
							},
							{
								label: "Difficulty",
								desc: "Easy for concept review, Medium for standard exam prep, Hard for high-stakes simulation.",
							},
							{
								label: "Focus (optional)",
								desc: 'Narrow the topic further, e.g. "chest pain" or "altered mental status".',
							},
						].map((item) => (
							<div
								key={item.label}
								className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3"
							>
								<div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded bg-muted text-xs font-bold">
									{item.label[0]}
								</div>
								<div>
									<p className="text-sm font-medium">{item.label}</p>
									<p className="text-xs text-muted-foreground mt-0.5">
										{item.desc}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			),
		},
		{
			icon: <Stethoscope size={26} />,
			iconBg: "bg-teal-500/10 text-teal-600",
			title: "Work it like a real encounter",
			content: (
				<div className="space-y-3">
					<p className="text-sm text-muted-foreground">
						The AI plays the attending. You're the clerk or resident — gather
						information and reason through the diagnosis.
					</p>
					<div className="rounded-lg border bg-muted/30 p-4 space-y-3">
						{[
							"Read the opening presentation",
							"Request vitals, labs, or imaging",
							"State your differential diagnosis",
							"Propose a management plan",
						].map((text, i) => (
							<div key={text} className="flex items-center gap-3 text-sm">
								<span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-bold">
									{i + 1}
								</span>
								<span>{text}</span>
							</div>
						))}
					</div>
					<p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 leading-relaxed">
						Tip: the attending won't volunteer information — you have to ask,
						just like a real clinical encounter.
					</p>
				</div>
			),
		},
		{
			icon: <Brain size={26} />,
			iconBg: "bg-yellow-500/10 text-yellow-600",
			title: "Difficulty levels",
			content: (
				<div className="space-y-3">
					<p className="text-sm text-muted-foreground">
						Match the difficulty to where you are in your prep.
					</p>
					<div className="grid gap-2">
						{[
							{
								label: "Easy",
								color: "border-green-300 text-green-600",
								desc: "Classic presentations, single diagnosis, straightforward management.",
							},
							{
								label: "Medium",
								color: "border-yellow-300 text-yellow-600",
								desc: "Atypical findings, common mimics, requires a broad differential.",
							},
							{
								label: "Hard",
								color: "border-red-300 text-red-600",
								desc: "Rare conditions, complicating comorbidities, high-stakes decisions.",
							},
						].map((d) => (
							<div
								key={d.label}
								className="flex items-center gap-3 rounded-lg border p-2.5"
							>
								<span
									className={cn(
										"rounded border px-2 py-0.5 text-xs font-bold shrink-0",
										d.color,
									)}
								>
									{d.label}
								</span>
								<span className="text-xs text-muted-foreground">{d.desc}</span>
							</div>
						))}
					</div>
				</div>
			),
		},
		{
			icon: <Check size={26} />,
			iconBg: "bg-green-500/10 text-green-600",
			title: "Mark it done",
			content: (
				<div className="space-y-3">
					<p className="text-sm text-muted-foreground">
						Once you've reached a diagnosis and management plan, mark the case
						complete.
					</p>
					<div className="grid gap-2">
						{[
							{
								label: "Mark done",
								desc: "Closes the active case and moves it to your Completed list for future reference.",
							},
							{
								label: "Reopen",
								desc: "Changed your mind? Reopen any completed case to continue the conversation.",
							},
							{
								label: "Delete",
								desc: "Remove cases you no longer need. Your case library stays clean and focused.",
							},
						].map((item) => (
							<div
								key={item.label}
								className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3"
							>
								<div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded bg-muted text-xs font-bold">
									{item.label[0]}
								</div>
								<div>
									<p className="text-sm font-medium">{item.label}</p>
									<p className="text-xs text-muted-foreground mt-0.5">
										{item.desc}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			),
		},
	];

	const current = steps[step];
	const isLast = step === steps.length - 1;

	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) onClose();
			}}
		>
			<DialogContent className="max-w-md">
				{/* Step dots */}
				<div className="flex justify-center gap-1.5 mt-1">
					{steps.map((s, i) => (
						<button
							key={s.title}
							type="button"
							onClick={() => setStep(i)}
							aria-label={`Step ${i + 1}`}
							className={cn(
								"h-1.5 rounded-full transition-all duration-200",
								i === step
									? "w-6 bg-primary"
									: "w-1.5 bg-muted-foreground/25 hover:bg-muted-foreground/50",
							)}
						/>
					))}
				</div>

				{/* Icon + Title */}
				<div className="flex flex-col items-center text-center gap-3 mt-4">
					<div
						className={cn(
							"flex size-14 items-center justify-center rounded-2xl",
							current.iconBg,
						)}
					>
						{current.icon}
					</div>
					<DialogTitle className="text-xl">{current.title}</DialogTitle>
				</div>

				{/* Step content */}
				<div className="mt-1">{current.content}</div>

				{/* Navigation */}
				<div className="flex items-center justify-between mt-4 pt-4 border-t">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setStep((s) => s - 1)}
						disabled={step === 0}
						className="w-20"
					>
						<ChevronLeft size={14} className="mr-1" />
						Back
					</Button>
					<span className="text-xs text-muted-foreground">
						{step + 1} / {steps.length}
					</span>
					{isLast ? (
						<Button size="sm" onClick={onClose} className="w-20">
							Got it!
						</Button>
					) : (
						<Button
							size="sm"
							onClick={() => setStep((s) => s + 1)}
							className="w-20"
						>
							Next
							<ChevronRight size={14} className="ml-1" />
						</Button>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function CasesPage() {
	const [cases, setCases] = useState<ClinicalCase[]>(() => getCases());
	const [creating, setCreating] = useState(false);
	const [activeCase, setActiveCase] = useState<ClinicalCase | null>(null);
	const [showGuide, setShowGuide] = useState(
		() => !localStorage.getItem(GUIDE_KEY),
	);

	function openGuide() {
		setShowGuide(true);
	}

	function closeGuide() {
		localStorage.setItem(GUIDE_KEY, "1");
		setShowGuide(false);
	}

	function refresh() {
		setCases(getCases());
	}

	function remove(id: string, e: React.MouseEvent) {
		e.stopPropagation();
		deleteCase(id);
		refresh();
	}

	if (activeCase) {
		return (
			<CaseConversation
				clinicalCase={activeCase}
				onBack={() => {
					setActiveCase(null);
					refresh();
				}}
			/>
		);
	}

	const active = cases.filter((c) => c.status === "active");
	const completed = cases.filter((c) => c.status === "completed");

	return (
		<div className="flex flex-1 flex-col overflow-hidden">
			{/* Header */}
			<div className="flex items-center justify-between border-b px-6 py-4">
				<div>
					<h1 className="font-semibold text-lg">Clinical Cases</h1>
					<p className="text-xs text-muted-foreground mt-0.5">
						{active.length} active · {completed.length} completed
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="icon"
						onClick={openGuide}
						className="h-8 w-8 text-muted-foreground"
						title="How it works"
					>
						<CircleHelp size={15} />
					</Button>
					<Button onClick={() => setCreating(true)}>
						<Sparkles size={14} className="mr-2" />
						Generate case
					</Button>
				</div>
			</div>

			<AiDisclaimer storageKey="aimed:cases-disclaimer-seen" />

			<ScrollArea className="flex-1 px-6 py-4">
				{cases.length === 0 ? (
					<div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
						<div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
							<Stethoscope size={24} className="text-muted-foreground" />
						</div>
						<div>
							<p className="font-medium">No cases yet</p>
							<p className="text-sm text-muted-foreground mt-1">
								Generate a clinical case to start practicing
							</p>
						</div>
						<Button onClick={() => setCreating(true)}>
							<Plus size={14} className="mr-2" />
							Generate your first case
						</Button>
					</div>
				) : (
					<div className="flex flex-col gap-6 p-1">
						{active.length > 0 && (
							<section>
								<h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
									Active
								</h2>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									{active.map((c) => (
										<Card
											key={c.id}
											className="group cursor-pointer transition-all hover:shadow-md hover:ring-1 hover:ring-ring/30"
											onClick={() => setActiveCase(c)}
										>
											<CardHeader className="pb-2">
												<div className="flex items-start justify-between gap-2">
													<div className="flex items-center gap-2 flex-wrap">
														<Badge variant="secondary" className="text-xs">
															{c.category}
														</Badge>
														<Badge
															variant="outline"
															className={cn(
																"text-xs",
																c.difficulty === "hard"
																	? "border-red-300 text-red-600"
																	: c.difficulty === "medium"
																		? "border-yellow-300 text-yellow-600"
																		: "border-green-300 text-green-600",
															)}
														>
															{c.difficulty}
														</Badge>
													</div>
													<button
														type="button"
														onClick={(e) => remove(c.id, e)}
														className="text-muted-foreground hover:text-destructive"
													>
														<Trash2 size={13} />
													</button>
												</div>
												<p className="font-medium text-sm mt-1">{c.title}</p>
											</CardHeader>
											<CardContent>
												<p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
													{c.initialPresentation}
												</p>
												<p className="text-xs text-muted-foreground mt-2">
													{c.messages.length} messages ·{" "}
													{new Date(c.updatedAt).toLocaleDateString()}
												</p>
											</CardContent>
										</Card>
									))}
								</div>
							</section>
						)}

						{completed.length > 0 && (
							<section>
								<h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
									Completed
								</h2>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									{completed.map((c) => (
										<Card
											key={c.id}
											className="group cursor-pointer opacity-70 hover:opacity-100 transition-all hover:shadow-md"
											onClick={() => setActiveCase(c)}
										>
											<CardHeader className="pb-2">
												<div className="flex items-start justify-between gap-2">
													<div className="flex items-center gap-2 flex-wrap">
														<Badge variant="secondary" className="text-xs">
															{c.category}
														</Badge>
														<Badge variant="default" className="text-xs gap-1">
															<Check size={10} /> Done
														</Badge>
													</div>
													<button
														type="button"
														onClick={(e) => remove(c.id, e)}
														className="text-muted-foreground hover:text-destructive"
													>
														<Trash2 size={13} />
													</button>
												</div>
												<p className="font-medium text-sm mt-1">{c.title}</p>
											</CardHeader>
											<CardContent>
												<p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
													{c.initialPresentation}
												</p>
											</CardContent>
										</Card>
									))}
								</div>
							</section>
						)}
					</div>
				)}
			</ScrollArea>

			<CreateCaseDialog
				open={creating}
				onClose={() => {
					setCreating(false);
					refresh();
				}}
			/>
			<ClinicalCaseGuide
				key={String(showGuide)}
				open={showGuide}
				onClose={closeGuide}
			/>
		</div>
	);
}
