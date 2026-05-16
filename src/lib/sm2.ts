import type { Flashcard } from "@/types";

// FSRS v4 default weights (trained on open SR datasets)
const W = [
	0.4,   // w[0]  initial stability — Again
	0.6,   // w[1]  initial stability — Hard
	2.4,   // w[2]  initial stability — Good
	5.8,   // w[3]  initial stability — Easy
	4.93,  // w[4]  initial difficulty base (D₀ at Good)
	0.94,  // w[5]  D₀ grade scale
	0.86,  // w[6]  difficulty update step
	0.01,  // w[7]  difficulty mean-reversion weight
	1.49,  // w[8]  recall stability — base exponent
	0.14,  // w[9]  recall stability — S decay factor
	0.94,  // w[10] recall stability — R sensitivity
	2.18,  // w[11] lapse stability — base
	0.05,  // w[12] lapse stability — D exponent
	0.34,  // w[13] lapse stability — S exponent
	1.26,  // w[14] lapse stability — R exponent
	0.29,  // w[15] hard penalty multiplier
	2.61,  // w[16] easy bonus multiplier
];

// 6-hour floor: prevents cards from becoming due immediately after a lapse
const MIN_STABILITY = 6 / 24; // days

const TARGET_RETENTION = 0.9;

function clamp(x: number, lo: number, hi: number) {
	return Math.max(lo, Math.min(hi, x));
}

// R(t, S) = 0.9^(t/S) — probability of recall t days after a review with stability S
function retrievability(elapsedDays: number, stability: number): number {
	return TARGET_RETENTION ** (elapsedDays / stability);
}

function initialStability(grade: number): number {
	return Math.max(W[grade - 1], MIN_STABILITY);
}

// Higher grade on first review → lower difficulty (easier card)
function initialDifficulty(grade: number): number {
	return clamp(W[4] - W[5] * (grade - 3), 1, 10);
}

// Stability after a successful recall — grows more with Good/Easy, less with Hard
function stabilityAfterRecall(
	D: number,
	S: number,
	R: number,
	grade: number,
): number {
	const hardPenalty = grade === 2 ? W[15] : 1;
	const easyBonus = grade === 4 ? W[16] : 1;
	return (
		S *
		(Math.exp(W[8]) *
			(11 - D) *
			S ** -W[9] *
			(Math.exp(W[10] * (1 - R)) - 1) *
			hardPenalty *
			easyBonus +
			1)
	);
}

// Stability after a lapse — resets based on current difficulty and prior stability
function stabilityAfterLapse(D: number, S: number, R: number): number {
	return (
		W[11] *
		D ** -W[12] *
		((S + 1) ** W[13] - 1) *
		Math.exp(W[14] * (1 - R))
	);
}

// Difficulty drifts toward D₀(Good) over time (mean reversion)
function nextDifficulty(D: number, grade: number): number {
	const D1 = D - W[6] * (grade - 3);
	return clamp(D1 + W[7] * (W[4] - D1), 1, 10);
}

// ── SRS stages ────────────────────────────────────────────────────────────────

export interface SrsStage {
	name: string;
	bgClass: string;
	ringClass: string;
}

// Nine stages mapped to stability thresholds (days)
//   Clerkship I   < 0.5 d  (~12 h)
//   Clerkship II  0.5–1 d
//   Clerkship III 1–4 d
//   Clerkship IV  4–14 d
//   Resident I    14–30 d
//   Resident II   30–90 d
//   Fellow        90–180 d
//   Attending     180–365 d
//   Board-Certified 365+ d
const STAGE_THRESHOLDS = [0.5, 1, 4, 14, 30, 90, 180, 365] as const;

const STAGES: SrsStage[] = [
	{ name: "Clerkship I",     bgClass: "bg-[oklch(0.70_0.12_55)]",  ringClass: "ring-[oklch(0.78_0.10_55)]" },
	{ name: "Clerkship II",    bgClass: "bg-[oklch(0.70_0.12_55)]",  ringClass: "ring-[oklch(0.78_0.10_55)]" },
	{ name: "Clerkship III",   bgClass: "bg-[oklch(0.70_0.12_55)]",  ringClass: "ring-[oklch(0.78_0.10_55)]" },
	{ name: "Clerkship IV",    bgClass: "bg-[oklch(0.70_0.12_55)]",  ringClass: "ring-[oklch(0.78_0.10_55)]" },
	{ name: "Resident I",      bgClass: "bg-[oklch(0.55_0.12_145)]", ringClass: "ring-[oklch(0.65_0.10_145)]" },
	{ name: "Resident II",     bgClass: "bg-[oklch(0.55_0.12_145)]", ringClass: "ring-[oklch(0.65_0.10_145)]" },
	{ name: "Fellow",          bgClass: "bg-[oklch(0.48_0.12_264)]", ringClass: "ring-[oklch(0.58_0.10_264)]" },
	{ name: "Attending",       bgClass: "bg-[oklch(0.40_0.15_280)]", ringClass: "ring-[oklch(0.50_0.12_280)]" },
	{ name: "Board-Certified", bgClass: "bg-[oklch(0.34_0.16_295)]", ringClass: "ring-[oklch(0.44_0.13_295)]" },
];

export function getSrsStage(card: Flashcard): SrsStage {
	const s = card.stability ?? 0;
	const idx = STAGE_THRESHOLDS.findIndex((t) => s < t);
	return STAGES[idx === -1 ? 8 : idx];
}

// ── Public API ────────────────────────────────────────────────────────────────

export function applyReview(card: Flashcard, grade: number): Flashcard {
	const now = Date.now();

	const elapsed = card.lastReviewed
		? Math.max((now - card.lastReviewed) / 86_400_000, 0)
		: 0;

	// Migrate cards created under the old SM-2 algorithm gracefully
	const lastS =
		card.stability && card.stability > 0
			? card.stability
			: Math.max(card.interval ?? 0, MIN_STABILITY);
	const lastD =
		card.difficulty && card.difficulty > 0
			? card.difficulty
			: initialDifficulty(3); // assume medium difficulty for legacy cards

	const isFirstReview = !card.lastReviewed;

	let S: number;
	let D: number;
	let newReps: number;

	if (isFirstReview) {
		// Initial stability and difficulty set entirely by the first grade
		S = initialStability(grade);
		D = initialDifficulty(grade);
		newReps = grade >= 3 ? 1 : 0;
	} else {
		const R = retrievability(elapsed, lastS);
		D = nextDifficulty(lastD, grade);

		if (grade < 3) {
			// Lapse: stability resets; harder cards recover more slowly
			S = Math.max(stabilityAfterLapse(lastD, lastS, R), MIN_STABILITY);
			newReps = card.repetitions;
		} else {
			// Recall: stability grows; rate depends on difficulty, current S, and R
			S = stabilityAfterRecall(lastD, lastS, R, grade);
			newReps = card.repetitions + 1;
		}
	}

	const intervalDays = Math.max(S, MIN_STABILITY);

	return {
		...card,
		stability: S,
		difficulty: D,
		interval: intervalDays,
		repetitions: newReps,
		lastReviewed: now,
		dueDate: now + intervalDays * 86_400_000,
	};
}

export function isDue(card: Flashcard): boolean {
	return Date.now() >= card.dueDate;
}

export function newCard(
	overrides: Partial<Flashcard> & { id: string; front: string; back: string },
): Flashcard {
	return {
		category: "General",
		tags: [],
		stability: 0,
		difficulty: W[4], // 4.93 — medium difficulty until first review
		interval: 0,
		repetitions: 0,
		dueDate: Date.now(),
		createdAt: Date.now(),
		...overrides,
	};
}
