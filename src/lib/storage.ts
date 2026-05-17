import type {
	AppSettings,
	ChatSession,
	ClinicalCase,
	Flashcard,
	FlashcardDeck,
	StudyStats,
} from "@/types";

const KEYS = {
	SETTINGS: "aimed:settings",
	CHAT_SESSIONS: "aimed:chat-sessions",
	FLASHCARDS: "aimed:flashcards",
	DECKS: "aimed:decks",
	CASES: "aimed:cases",
	STATS: "aimed:stats",
	CUSTOM_CATEGORIES: "aimed:custom-categories",
} as const;

function read<T>(key: string, fallback: T): T {
	try {
		const raw = localStorage.getItem(key);
		return raw ? (JSON.parse(raw) as T) : fallback;
	} catch {
		return fallback;
	}
}

function write<T>(key: string, value: T): void {
	localStorage.setItem(key, JSON.stringify(value));
}

// ── Settings ────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: AppSettings = {
	ollama: {
		baseUrl: "http://localhost:11434",
		model: "medgemma",
		temperature: 0.7,
	},
	cloud: {
		baseUrl: "https://ollama.com",
		model: "gemma3:4b",
		temperature: 0.7,
		apiKey: "",
	},
	mode: "cloud",
	theme: "system",
};

export function getSettings(): AppSettings {
	const stored = read<Partial<AppSettings>>(KEYS.SETTINGS, {});
	return {
		...DEFAULT_SETTINGS,
		...stored,
		ollama: { ...DEFAULT_SETTINGS.ollama, ...stored.ollama },
		cloud: { ...DEFAULT_SETTINGS.cloud, ...stored.cloud },
	};
}

export function saveSettings(settings: AppSettings): void {
	write(KEYS.SETTINGS, settings);
	window.dispatchEvent(new CustomEvent("aimed:settings-changed"));
}

// ── Chat sessions ────────────────────────────────────────────────────────────

export function getChatSessions(): ChatSession[] {
	return read<ChatSession[]>(KEYS.CHAT_SESSIONS, []);
}

export function saveChatSession(session: ChatSession): void {
	const sessions = getChatSessions();
	const idx = sessions.findIndex((s) => s.id === session.id);
	if (idx >= 0) sessions[idx] = session;
	else sessions.unshift(session);
	write(KEYS.CHAT_SESSIONS, sessions);
}

export function deleteChatSession(id: string): void {
	write(
		KEYS.CHAT_SESSIONS,
		getChatSessions().filter((s) => s.id !== id),
	);
}

// ── Flashcards ───────────────────────────────────────────────────────────────

export function getFlashcards(): Flashcard[] {
	return read<Flashcard[]>(KEYS.FLASHCARDS, []);
}

export function saveFlashcard(card: Flashcard): void {
	const cards = getFlashcards();
	const idx = cards.findIndex((c) => c.id === card.id);
	if (idx >= 0) cards[idx] = card;
	else cards.unshift(card);
	write(KEYS.FLASHCARDS, cards);
}

export function deleteFlashcard(id: string): void {
	write(
		KEYS.FLASHCARDS,
		getFlashcards().filter((c) => c.id !== id),
	);
}

export function getDecks(): FlashcardDeck[] {
	return read<FlashcardDeck[]>(KEYS.DECKS, []);
}

export function saveDeck(deck: FlashcardDeck): void {
	const decks = getDecks();
	const idx = decks.findIndex((d) => d.id === deck.id);
	if (idx >= 0) decks[idx] = deck;
	else decks.unshift(deck);
	write(KEYS.DECKS, decks);
}

export function deleteDeck(id: string): void {
	write(
		KEYS.DECKS,
		getDecks().filter((d) => d.id !== id),
	);
}

// ── Clinical cases ────────────────────────────────────────────────────────────

export function getCases(): ClinicalCase[] {
	return read<ClinicalCase[]>(KEYS.CASES, []);
}

export function saveCase(c: ClinicalCase): void {
	const cases = getCases();
	const idx = cases.findIndex((x) => x.id === c.id);
	if (idx >= 0) cases[idx] = c;
	else cases.unshift(c);
	write(KEYS.CASES, cases);
}

export function deleteCase(id: string): void {
	write(
		KEYS.CASES,
		getCases().filter((c) => c.id !== id),
	);
}

// ── Stats ─────────────────────────────────────────────────────────────────────

const DEFAULT_STATS: StudyStats = {
	totalFlashcardsReviewed: 0,
	totalCasesCompleted: 0,
	totalChatMessages: 0,
	streakDays: 0,
};

export function getStats(): StudyStats {
	return read<StudyStats>(KEYS.STATS, DEFAULT_STATS);
}

export function updateStats(patch: Partial<StudyStats>): void {
	write(KEYS.STATS, { ...getStats(), ...patch });
}

// ── Custom categories ────────────────────────────────────────────────────────

export function getCustomCategories(): string[] {
	return read<string[]>(KEYS.CUSTOM_CATEGORIES, []);
}

export function saveCustomCategory(cat: string): void {
	const existing = getCustomCategories();
	if (!existing.includes(cat)) {
		write(KEYS.CUSTOM_CATEGORIES, [...existing, cat]);
	}
}

export function deleteCustomCategory(cat: string): void {
	write(KEYS.CUSTOM_CATEGORIES, getCustomCategories().filter((c) => c !== cat));
}

export function reassignFlashcardCategory(from: string, to: string): void {
	const cards = getFlashcards().map((c) =>
		c.category === from ? { ...c, category: to } : c,
	);
	write(KEYS.FLASHCARDS, cards);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
