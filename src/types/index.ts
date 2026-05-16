export type MessageRole = "user" | "assistant" | "system";

export interface Message {
	id: string;
	role: MessageRole;
	content: string;
	timestamp: number;
}

export interface ChatSession {
	id: string;
	title: string;
	messages: Message[];
	createdAt: number;
	updatedAt: number;
}

export type FlashcardDifficulty = "easy" | "medium" | "hard";

export interface Flashcard {
	id: string;
	front: string;
	back: string;
	category: string;
	tags: string[];
	// FSRS scheduling
	stability: number;   // S: days until 90% recall probability
	difficulty: number;  // D: 1–10 scale (higher = harder to remember)
	// Shared / derived
	interval: number;    // last scheduled interval in days
	repetitions: number; // successful review count
	dueDate: number;
	createdAt: number;
	lastReviewed?: number;
	// Legacy SM-2 field kept for existing localStorage data
	easeFactor?: number;
}

export type FlashcardDeck = {
	id: string;
	name: string;
	description: string;
	cardIds: string[];
	createdAt: number;
};

export type CaseStatus = "active" | "completed";

export interface ClinicalCase {
	id: string;
	title: string;
	category: string; // e.g. "Cardiology", "Neurology"
	difficulty: FlashcardDifficulty;
	initialPresentation: string;
	messages: Message[];
	diagnosis?: string;
	status: CaseStatus;
	createdAt: number;
	updatedAt: number;
}

export interface OllamaSettings {
	baseUrl: string;
	model: string;
	temperature: number;
	apiKey?: string;
}

export type ModelMode = "local" | "cloud";

export interface AppSettings {
	ollama: OllamaSettings;
	cloud: OllamaSettings;
	mode: ModelMode;
	theme: "light" | "dark" | "system";
}

export interface StudyStats {
	totalFlashcardsReviewed: number;
	totalCasesCompleted: number;
	totalChatMessages: number;
	streakDays: number;
	lastStudied?: number;
}
