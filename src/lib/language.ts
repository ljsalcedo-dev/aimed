import { franc } from "franc-min";

// Returns true if the text is detected as non-English.
// franc returns ISO 639-3 codes; 'eng' = English, 'und' = undetermined (too short).
// Undetermined is treated as English so very short inputs aren't wrongly blocked.
export function isNonEnglish(text: string): boolean {
	const trimmed = text.trim();
	if (trimmed.length < 10) return false;
	const detected = franc(trimmed);
	return detected !== "eng" && detected !== "und";
}
