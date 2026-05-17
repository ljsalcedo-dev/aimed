import { Info, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AiDisclaimerProps {
	storageKey: string;
	className?: string;
}

export function AiDisclaimer({ storageKey, className }: AiDisclaimerProps) {
	const [dismissed, setDismissed] = useState(
		() => !!localStorage.getItem(storageKey),
	);

	if (dismissed) return null;

	function dismiss() {
		localStorage.setItem(storageKey, "1");
		setDismissed(true);
	}

	return (
		<div
			className={cn(
				"flex shrink-0 items-start gap-3 border-b bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 px-4 py-3",
				className,
			)}
		>
			<Info
				size={14}
				className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
			/>
			<div className="flex-1 min-w-0">
				<p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
					For educational use only
				</p>
				<p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-0.5 leading-relaxed">
					AI-generated responses are designed to support exam preparation and
					may occasionally be inaccurate or incomplete. Always verify clinical
					information against authoritative medical references.
				</p>
			</div>
			<button
				type="button"
				onClick={dismiss}
				aria-label="Dismiss"
				className="mt-0.5 shrink-0 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 transition-colors"
			>
				<X size={13} />
			</button>
		</div>
	);
}
