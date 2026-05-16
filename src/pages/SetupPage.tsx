import {
	ArrowRight,
	BrainCircuit,
	Check,
	Copy,
	ExternalLink,
	Loader2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkConnection } from "@/lib/ollama";
import { getSettings, saveSettings } from "@/lib/storage";

function Step({
	number,
	title,
	children,
}: {
	number: number;
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex gap-4">
			<div className="flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold text-muted-foreground mt-0.5">
				{number}
			</div>
			<div className="flex-1">
				<p className="text-sm font-medium mb-1.5">{title}</p>
				{children}
			</div>
		</div>
	);
}

function CodeBlock({ children }: { children: string }) {
	const [copied, setCopied] = useState(false);

	function copy() {
		navigator.clipboard.writeText(children);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	return (
		<div className="flex items-center justify-between gap-3 rounded-md bg-muted px-3 py-2 mt-2">
			<code className="font-mono text-xs text-foreground">{children}</code>
			<button
				type="button"
				onClick={copy}
				className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
				aria-label="Copy"
			>
				{copied ? <Check size={12} /> : <Copy size={12} />}
			</button>
		</div>
	);
}

export function SetupPage() {
	const navigate = useNavigate();
	const current = getSettings();
	const [url, setUrl] = useState(current.ollama.baseUrl);
	const [status, setStatus] = useState<"idle" | "checking" | "ok" | "fail">(
		"idle",
	);

	async function test() {
		setStatus("checking");
		const ok = await checkConnection(url);
		if (ok) {
			saveSettings({ ...getSettings(), ollama: { ...getSettings().ollama, baseUrl: url } });
		}
		setStatus(ok ? "ok" : "fail");
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
			<div className="w-full max-w-md">
				<div className="flex items-center gap-2.5 mb-10">
					<div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
						<BrainCircuit size={18} />
					</div>
					<span className="font-semibold text-sm">aimed</span>
				</div>

				<h1 className="text-lg font-semibold">Get started</h1>
				<p className="text-sm text-muted-foreground mt-1 mb-8">
					aimed runs MedGemma locally via Ollama. Nothing leaves your device.
				</p>

				<div className="flex flex-col gap-7">
					<Step number={1} title="Install Ollama">
						<p className="text-sm text-muted-foreground">
							Download and install Ollama for your platform.
						</p>
						<a
							href="https://ollama.com/download"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1.5 text-sm text-interactive-accent hover:underline mt-2"
						>
							ollama.com/download
							<ExternalLink size={12} />
						</a>
					</Step>

					<Step number={2} title="Pull the model">
						<p className="text-sm text-muted-foreground">
							Run this in your terminal:
						</p>
						<CodeBlock>{`ollama pull ${current.ollama.model}`}</CodeBlock>
						<p className="text-xs text-muted-foreground mt-2">
							About 5 GB. Ollama starts automatically on most systems. If not,
							also run{" "}
							<code className="font-mono bg-muted px-1 py-0.5 rounded">
								ollama serve
							</code>
							.
						</p>
					</Step>

					<Step number={3} title="Verify connection">
						<p className="text-sm text-muted-foreground mb-2.5">
							Confirm aimed can reach Ollama:
						</p>
						<div className="flex gap-2">
							<Input
								value={url}
								onChange={(e) => {
									setUrl(e.target.value);
									setStatus("idle");
								}}
								className="font-mono text-xs"
								placeholder="http://localhost:11434"
							/>
							<Button
								variant="outline"
								onClick={test}
								disabled={status === "checking"}
								className="shrink-0"
							>
								{status === "checking" ? (
									<Loader2 size={14} className="animate-spin" />
								) : (
									"Test"
								)}
							</Button>
						</div>

						{status === "ok" && (
							<div className="flex items-center gap-2 mt-3 text-sm text-success">
								<Check size={14} />
								Connected
							</div>
						)}
						{status === "fail" && (
							<p className="mt-3 text-sm text-destructive">
								Could not connect. Is Ollama running?
							</p>
						)}
					</Step>
				</div>

				<div className="mt-8 flex flex-col items-center gap-1">
					<Button
						onClick={() => navigate("/chat")}
						disabled={status !== "ok"}
						className="w-full"
					>
						Start studying
						<ArrowRight size={14} className="ml-2" />
					</Button>
					<button
						type="button"
						onClick={() => navigate("/chat")}
						className="text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
					>
						Skip for now
					</button>
				</div>
			</div>
		</div>
	);
}
