import {
	BookOpen,
	Check,
	ChevronLeft,
	Loader2,
	Plus,
	Sparkles,
	Trash2,
	X,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { streamChat } from "@/lib/ollama";
import { applyReview, getSrsStage, isDue, newCard } from "@/lib/sm2";
import {
	deleteFlashcard,
	generateId,
	getFlashcards,
	getStats,
	saveFlashcard,
	updateStats,
} from "@/lib/storage";
import { cn } from "@/lib/utils";
import type { Flashcard } from "@/types";

const CATEGORIES = [
	"General",
	"Anatomy",
	"Physiology",
	"Pharmacology",
	"Pathology",
	"Microbiology",
	"Biochemistry",
	"Cardiology",
	"Neurology",
	"Pulmonology",
	"Gastroenterology",
	"Endocrinology",
	"Immunology",
	"Hematology",
	"Nephrology",
	"Psychiatry",
	"Pediatrics",
	"Obstetrics",
	"Surgery",
];

function shuffle<T>(arr: T[]): T[] {
	const out = [...arr];
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[out[i], out[j]] = [out[j], out[i]];
	}
	return out;
}

// Colored SRS stage pill
function StageBadge({
	card,
	className,
}: {
	card: Flashcard;
	className?: string;
}) {
	const stage = getSrsStage(card);
	return (
		<span
			className={cn(
				"inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold leading-none text-[oklch(0.98_0.003_264)]",
				stage.bgClass,
				className,
			)}
		>
			{stage.name}
		</span>
	);
}

// Stacked distribution bar
function SrsDistribution({ cards }: { cards: Flashcard[] }) {
	if (cards.length === 0) return null;

	const total = cards.length;
	// Group boundaries match the STAGE_THRESHOLDS in sm2.ts (days of stability)
	const groups = [
		{ label: "Clerkship",       minS: 0,   maxS: 14,       bgClass: "bg-sky-500" },
		{ label: "Resident",        minS: 14,  maxS: 90,       bgClass: "bg-teal-600" },
		{ label: "Fellow",          minS: 90,  maxS: 180,      bgClass: "bg-indigo-500" },
		{ label: "Attending",       minS: 180, maxS: 365,      bgClass: "bg-violet-600" },
		{ label: "Board-Certified", minS: 365, maxS: Infinity, bgClass: "bg-purple-700" },
	];

	const counts = groups.map((g) => ({
		...g,
		count: cards.filter((c) => {
			const s = c.stability ?? 0;
			return s >= g.minS && s < g.maxS;
		}).length,
	}));

	return (
		<div className="px-6 py-3 border-b space-y-2">
			<div className="flex h-2 rounded-full overflow-hidden bg-muted">
				{counts.map((g) =>
					g.count > 0 ? (
						<div
							key={g.label}
							className={cn("h-full", g.bgClass)}
							style={{ width: `${(g.count / total) * 100}%` }}
							title={`${g.label}: ${g.count}`}
						/>
					) : null,
				)}
			</div>
			<div className="flex flex-wrap gap-4">
				{counts.map((g) => (
					<span
						key={g.label}
						className="flex items-center gap-1.5 text-xs text-muted-foreground"
					>
						<span className={cn("size-2 rounded-full shrink-0", g.bgClass)} />
						{g.label}
						<span className="font-medium text-foreground">{g.count}</span>
					</span>
				))}
			</div>
		</div>
	);
}

interface SessionResult {
	id: string;
	front: string;
	category: string;
	firstTryCorrect: boolean;
	leveled: boolean;
}

// ── Review mode ──────────────────────────────────────────────────────────────

function ReviewMode({
	cards,
	onExit,
}: {
	cards: Flashcard[];
	onExit: () => void;
}) {
	const totalUnique = cards.length;
	const [queue, setQueue] = useState<Flashcard[]>(() => shuffle([...cards]));
	const [flipped, setFlipped] = useState(false);
	// Tracks how many times each card was answered wrong in this session
	const [failedMap, setFailedMap] = useState<Record<string, number>>({});
	const [results, setResults] = useState<SessionResult[]>([]);

	const current = queue[0];
	const isDone = queue.length === 0;

	function rate(quality: number) {
		if (!current) return;

		const prevReps = current.repetitions;
		const updated = applyReview(current, quality);
		saveFlashcard(updated);

		if (quality < 3) {
			// Wrong: increment failure count and re-insert a few slots back
			setFailedMap((f) => ({
				...f,
				[current.id]: (f[current.id] || 0) + 1,
			}));
			setQueue((q) => {
				const [, ...rest] = q;
				const pos = Math.min(3, rest.length);
				return [...rest.slice(0, pos), updated, ...rest.slice(pos)];
			});
		} else {
			// Correct: record result and dequeue
			setResults((r) => [
				...r,
				{
					id: current.id,
					front: current.front,
					category: current.category,
					firstTryCorrect: !failedMap[current.id],
					leveled: updated.repetitions > prevReps,
				},
			]);
			setQueue((q) => q.slice(1));
			const stats = getStats();
			updateStats({
				totalFlashcardsReviewed: stats.totalFlashcardsReviewed + 1,
				lastStudied: Date.now(),
			});
		}
		setFlipped(false);
	}

	// ── Summary screen ──
	if (isDone) {
		const correctCount = results.filter((r) => r.firstTryCorrect).length;
		const pct =
			totalUnique > 0 ? Math.round((correctCount / totalUnique) * 100) : 0;
		const leveledCount = results.filter((r) => r.leveled).length;

		return (
			<div className="flex flex-1 flex-col items-center justify-center gap-8 px-8 max-w-lg mx-auto w-full text-center">
				<div className="flex size-16 items-center justify-center rounded-full bg-success/15">
					<Check size={32} className="text-success" />
				</div>
				<div>
					<h2 className="text-2xl font-semibold">Session complete!</h2>
					<p className="text-muted-foreground mt-1">
						{totalUnique} card{totalUnique !== 1 ? "s" : ""} reviewed
					</p>
				</div>
				<div className="grid grid-cols-3 gap-4 w-full">
					<div className="rounded-xl border p-4">
						<p className="text-3xl font-bold">{correctCount}</p>
						<p className="text-xs text-muted-foreground mt-1">Correct first try</p>
					</div>
					<div className="rounded-xl border p-4">
						<p className="text-3xl font-bold">{pct}%</p>
						<p className="text-xs text-muted-foreground mt-1">Accuracy</p>
					</div>
					<div className="rounded-xl border p-4">
						<p className="text-3xl font-bold">{leveledCount}</p>
						<p className="text-xs text-muted-foreground mt-1">Leveled up</p>
					</div>
				</div>
				<Button size="lg" onClick={onExit}>
					Back to library
				</Button>
			</div>
		);
	}

	const stage = getSrsStage(current);
	const queueExtra = queue.length - (totalUnique - results.length);

	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 max-w-2xl mx-auto w-full">
			{/* Progress */}
			<div className="w-full flex items-center gap-3">
				<Button
					variant="ghost"
					size="icon"
					onClick={onExit}
					className="h-8 w-8 shrink-0"
				>
					<ChevronLeft size={16} />
				</Button>
				<div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
					<div
						className="h-full bg-primary transition-all duration-300"
						style={{ width: `${(results.length / totalUnique) * 100}%` }}
					/>
				</div>
				<span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
					{results.length} / {totalUnique}
					{queueExtra > 0 && (
						<span className="text-muted-foreground/60">
							{" "}· {queueExtra} requeued
						</span>
					)}
				</span>
			</div>

			{/* Card */}
			<button
				type="button"
				className="w-full text-left cursor-pointer select-none"
				onClick={() => setFlipped((f) => !f)}
			>
				<Card
					className={cn(
						"min-h-52 transition-all duration-200 hover:shadow-md ring-1",
						stage.ringClass,
					)}
				>
					<CardHeader className="pb-2">
						<div className="flex items-center justify-between">
							<Badge variant="secondary" className="text-xs">
								{current.category}
							</Badge>
							<div className="flex items-center gap-2">
								<StageBadge card={current} />
								<span className="text-xs text-muted-foreground">
									{flipped ? "Answer" : "Question"}
								</span>
							</div>
						</div>
					</CardHeader>
					<CardContent className="flex items-center justify-center min-h-32">
						<p className="text-center text-base leading-relaxed whitespace-pre-wrap">
							{flipped ? current.back : current.front}
						</p>
					</CardContent>
					{!flipped && (
						<CardFooter className="justify-center">
							<p className="text-xs text-muted-foreground">
								Tap to reveal answer
							</p>
						</CardFooter>
					)}
				</Card>
			</button>

			{/* Rating buttons */}
			{flipped && (
				<div className="flex gap-3 w-full justify-center">
					<Button
						variant="outline"
						className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 flex-1 max-w-28"
						onClick={() => rate(1)}
					>
						<X size={14} className="mr-1" /> Again
					</Button>
					<Button
						variant="outline"
						className="border-yellow-300 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950 flex-1 max-w-28"
						onClick={() => rate(3)}
					>
						Hard
					</Button>
					<Button
						variant="outline"
						className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 flex-1 max-w-28"
						onClick={() => rate(4)}
					>
						Good
					</Button>
					<Button
						variant="outline"
						className="border-green-300 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 flex-1 max-w-28"
						onClick={() => rate(5)}
					>
						<Check size={14} className="mr-1" /> Easy
					</Button>
				</div>
			)}
		</div>
	);
}

// ── Create card dialog ────────────────────────────────────────────────────────

function CreateCardDialog({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	const [front, setFront] = useState("");
	const [back, setBack] = useState("");
	const [category, setCategory] = useState("General");
	const [topic, setTopic] = useState("");
	const [generating, setGenerating] = useState(false);

	async function generate() {
		if (!topic.trim()) return;
		setGenerating(true);
		setFront("");
		setBack("");

		try {
			const messages = [
				{
					id: "gen",
					role: "user" as const,
					content: `Create a single medical flashcard about: "${topic}"

Respond with ONLY these two lines, no extra text:
FRONT: [question or concept]
BACK: [answer or explanation]`,
					timestamp: Date.now(),
				},
			];

			const systemPrompt =
				"You are a medical education expert creating high-yield flashcards for USMLE/NCLEX exams. Follow the format exactly. Respond directly. Do not output any thinking, reasoning steps, or internal monologue.";

			let fullText = "";
			for await (const token of streamChat(messages, systemPrompt)) {
				fullText += token;
			}

			const frontMatch = fullText.match(/FRONT:\s*([\s\S]*?)(?=\nBACK:|$)/i);
			const backMatch = fullText.match(/BACK:\s*([\s\S]*)/i);

			setFront(frontMatch?.[1]?.trim() ?? "");
			setBack(backMatch?.[1]?.trim() ?? "");
		} finally {
			setGenerating(false);
		}
	}

	function save() {
		if (!front.trim() || !back.trim()) return;
		const card = newCard({
			id: generateId(),
			front: front.trim(),
			back: back.trim(),
			category,
		});
		saveFlashcard(card);
		setFront("");
		setBack("");
		setTopic("");
		setCategory("General");
		onClose();
	}

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>Create flashcard</DialogTitle>
				</DialogHeader>
				<div className="flex flex-col gap-4">
					{/* AI generation */}
					<div className="flex gap-2">
						<Input
							placeholder="Topic to generate (e.g. Conn's syndrome)"
							value={topic}
							onChange={(e) => setTopic(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") generate();
							}}
						/>
						<Button
							variant="outline"
							onClick={generate}
							disabled={generating || !topic.trim()}
							className="shrink-0"
						>
							{generating ? (
								<Loader2 size={14} className="animate-spin" />
							) : (
								<Sparkles size={14} />
							)}
						</Button>
					</div>

					<div className="grid grid-cols-4 gap-2">
						{CATEGORIES.slice(0, 8).map((cat) => (
							<button
								key={cat}
								type="button"
								onClick={() => setCategory(cat)}
								className={cn(
									"rounded-md px-2 py-1 text-xs border transition-colors",
									category === cat
										? "bg-primary text-primary-foreground border-primary"
										: "hover:bg-muted",
								)}
							>
								{cat}
							</button>
						))}
					</div>

					<div className="flex flex-col gap-1.5">
						<Label>Front (question)</Label>
						<Textarea
							placeholder="What is the question or concept?"
							value={front}
							onChange={(e) => setFront(e.target.value)}
							rows={3}
						/>
					</div>

					<div className="flex flex-col gap-1.5">
						<Label>Back (answer)</Label>
						<Textarea
							placeholder="What is the answer or explanation?"
							value={back}
							onChange={(e) => setBack(e.target.value)}
							rows={4}
						/>
					</div>

					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button onClick={save} disabled={!front.trim() || !back.trim()}>
							Save card
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function FlashcardsPage() {
	const [cards, setCards] = useState<Flashcard[]>(() => getFlashcards());
	const [creating, setCreating] = useState(false);
	const [reviewing, setReviewing] = useState(false);
	const [filterCategory, setFilterCategory] = useState<string | null>(null);

	const dueCards = cards.filter(isDue);
	const displayed = filterCategory
		? cards.filter((c) => c.category === filterCategory)
		: cards;

	function refresh() {
		setCards(getFlashcards());
	}

	function remove(id: string) {
		deleteFlashcard(id);
		refresh();
	}

	if (reviewing) {
		const toReview = dueCards.length > 0 ? dueCards : cards;
		return (
			<ReviewMode
				cards={toReview}
				onExit={() => {
					setReviewing(false);
					refresh();
				}}
			/>
		);
	}

	return (
		<div className="flex flex-1 flex-col overflow-hidden">
			{/* Header */}
			<div className="flex items-center justify-between border-b px-6 py-4">
				<div>
					<h1 className="font-semibold text-lg">Flashcards</h1>
					<p className="text-xs text-muted-foreground mt-0.5">
						{cards.length} total · {dueCards.length} due
					</p>
				</div>
				<div className="flex gap-2">
					{dueCards.length > 0 && (
						<Button onClick={() => setReviewing(true)}>
							<BookOpen size={14} className="mr-2" />
							Review {dueCards.length} due
						</Button>
					)}
					{cards.length > 0 && dueCards.length === 0 && (
						<Button variant="outline" onClick={() => setReviewing(true)}>
							<BookOpen size={14} className="mr-2" />
							Review all
						</Button>
					)}
					<Button onClick={() => setCreating(true)}>
						<Plus size={14} className="mr-2" />
						Add card
					</Button>
				</div>
			</div>

			{/* SRS stage distribution */}
			<SrsDistribution cards={cards} />

			<Tabs
				defaultValue="library"
				className="flex flex-col flex-1 overflow-hidden"
			>
				<TabsList className="mx-6 mt-4 w-fit">
					<TabsTrigger value="library">Library</TabsTrigger>
					<TabsTrigger value="due">
						Due{" "}
						<Badge variant="secondary" className="ml-1.5 text-xs px-1.5">
							{dueCards.length}
						</Badge>
					</TabsTrigger>
				</TabsList>

				<TabsContent
					value="library"
					className="flex-1 overflow-hidden mt-0 pt-4"
				>
					{/* Category filter */}
					<div className="px-6 overflow-x-auto">
						<div className="flex gap-2 p-3">
							<button
								type="button"
								onClick={() => setFilterCategory(null)}
								className={cn(
									"rounded-full px-3 py-1 text-xs border whitespace-nowrap transition-colors",
									!filterCategory
										? "bg-primary text-primary-foreground"
										: "hover:bg-muted",
								)}
							>
								All ({cards.length})
							</button>
							{[...new Set(cards.map((c) => c.category))].map((cat) => (
								<button
									key={cat}
									type="button"
									onClick={() =>
										setFilterCategory(cat === filterCategory ? null : cat)
									}
									className={cn(
										"rounded-full px-3 py-1 text-xs border whitespace-nowrap transition-colors",
										filterCategory === cat
											? "bg-primary text-primary-foreground"
											: "hover:bg-muted",
									)}
								>
									{cat} ({cards.filter((c) => c.category === cat).length})
								</button>
							))}
						</div>
					</div>

					<ScrollArea className="flex-1 px-6">
						{displayed.length === 0 ? (
							<div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
								<p className="text-muted-foreground text-sm">No flashcards yet</p>
								<Button onClick={() => setCreating(true)} variant="outline">
									<Sparkles size={14} className="mr-2" />
									Generate with AI
								</Button>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 p-1">
								{displayed.map((card) => (
									<Card
										key={card.id}
										className={cn(
											"group relative flex flex-col",
											isDue(card) && "ring-1 ring-primary/40",
										)}
									>
										<CardHeader className="pb-2">
											<div className="flex items-start justify-between gap-2">
												<Badge
													variant="secondary"
													className="text-xs shrink-0"
												>
													{card.category}
												</Badge>
												<button
													type="button"
													onClick={() => remove(card.id)}
													className="text-muted-foreground hover:text-destructive transition-colors"
												>
													<Trash2 size={13} />
												</button>
											</div>
										</CardHeader>
										<CardContent className="pb-3 flex-1">
											<p className="text-sm font-medium line-clamp-3">
												{card.front}
											</p>
										</CardContent>
										<CardFooter className="pt-0 flex items-center justify-between">
											<StageBadge card={card} />
											<span className="text-xs text-muted-foreground">
												{isDue(card) ? (
													<span className="text-primary font-medium">
														Due now
													</span>
												) : (
													new Date(card.dueDate).toLocaleString([], { month: "numeric", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
												)}
											</span>
										</CardFooter>
									</Card>
								))}
							</div>
						)}
					</ScrollArea>
				</TabsContent>

				<TabsContent value="due" className="flex-1 overflow-hidden mt-0 pt-4">
					<ScrollArea className="flex-1 px-6">
						{dueCards.length === 0 ? (
							<div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
								<Check size={32} className="text-green-500" />
								<p className="font-medium">All caught up!</p>
								<p className="text-sm text-muted-foreground">
									No cards due for review right now.
								</p>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 p-1">
								{dueCards.map((card) => (
									<Card key={card.id} className="ring-1 ring-primary/40 flex flex-col">
										<CardHeader className="pb-2">
											<Badge variant="secondary" className="w-fit text-xs">
												{card.category}
											</Badge>
										</CardHeader>
										<CardContent className="flex-1">
											<p className="text-sm font-medium line-clamp-3">
												{card.front}
											</p>
										</CardContent>
										<CardFooter className="pt-0">
											<StageBadge card={card} />
										</CardFooter>
									</Card>
								))}
							</div>
						)}
					</ScrollArea>
				</TabsContent>
			</Tabs>

			<CreateCardDialog
				open={creating}
				onClose={() => {
					setCreating(false);
					refresh();
				}}
			/>
		</div>
	);
}
