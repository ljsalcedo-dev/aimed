import {
	ArrowRight,
	Check,
	Cloud,
	Copy,
	ExternalLink,
	Loader2,
	Monitor,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AimedLogoFull } from "@/components/layout/AimedLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { checkConnection } from "@/lib/ollama";
import { getSettings, saveSettings } from "@/lib/storage";

const CLOUD_MODELS = {
	free: [
		"gemma3:4b",
		"gemma3:12b",
		"llama3.2:3b",
		"llama3.1:8b",
		"mistral:7b",
		"qwen2.5:7b",
		"phi4",
	],
	paid: [
		"medgemma",
		"medgemma1.5",
		"gemma3:27b",
		"llama3.1:70b",
		"llama3.1:405b",
	],
};

function isLocalHost() {
	const h = window.location.hostname;
	return h === "localhost" || h === "127.0.0.1" || h === "::1";
}

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

type Platform = "windows" | "mac" | "linux" | "unknown";

function detectPlatform(): Platform {
	const ua = navigator.userAgent;
	if (ua.includes("Windows")) return "windows";
	if (ua.includes("Macintosh") || ua.includes("Mac OS")) return "mac";
	if (ua.includes("Linux")) return "linux";
	return "unknown";
}

const CORS_STEPS: Record<
	Exclude<Platform, "unknown">,
	{ shell: string; command: string; restartNote: string }
> = {
	windows: {
		shell: "PowerShell",
		command:
			'[System.Environment]::SetEnvironmentVariable("OLLAMA_ORIGINS","https://tauri.localhost","User")',
		restartNote:
			"Then quit Ollama from the system tray and reopen it for the change to take effect.",
	},
	mac: {
		shell: "Terminal",
		command: 'launchctl setenv OLLAMA_ORIGINS "tauri://localhost"',
		restartNote:
			"Then quit Ollama from the menu bar and reopen it. Re-run this command after each reboot.",
	},
	linux: {
		shell: "Terminal",
		command:
			"echo 'export OLLAMA_ORIGINS=\"tauri://localhost\"' >> ~/.bashrc && source ~/.bashrc",
		restartNote:
			'Then restart Ollama: run "ollama serve" in a new terminal, or "sudo systemctl restart ollama" if using systemd.',
	},
};

function LocalSetup({ onReady }: { onReady: () => void }) {
	const current = getSettings();
	const [url, setUrl] = useState(current.ollama.baseUrl);
	const [status, setStatus] = useState<"idle" | "checking" | "ok" | "fail">(
		"idle",
	);

	const platform = detectPlatform();
	const corsInfo = platform !== "unknown" ? CORS_STEPS[platform] : null;

	async function test() {
		setStatus("checking");
		const ok = await checkConnection(url);
		if (ok) {
			saveSettings({
				...getSettings(),
				mode: "local",
				ollama: { ...getSettings().ollama, baseUrl: url },
			});
			onReady();
		}
		setStatus(ok ? "ok" : "fail");
	}

	return (
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
					About 5 GB. Ollama starts automatically on most systems. If not, also
					run{" "}
					<code className="font-mono bg-muted px-1 py-0.5 rounded">
						ollama serve
					</code>
					.
				</p>
			</Step>

			<Step number={3} title="Allow app access">
				<p className="text-sm text-muted-foreground">
					Desktop apps run on a different origin than a browser, so Ollama blocks
					them by default. Run this once
					{corsInfo ? ` in ${corsInfo.shell}` : ""} to allow aimed:
				</p>
				{corsInfo ? (
					<>
						<CodeBlock>{corsInfo.command}</CodeBlock>
						<p className="text-xs text-muted-foreground mt-2">
							{corsInfo.restartNote}
						</p>
					</>
				) : (
					<div className="flex flex-col gap-2 mt-2">
						<p className="text-xs text-muted-foreground font-medium">Windows — PowerShell:</p>
						<CodeBlock>
							{CORS_STEPS.windows.command}
						</CodeBlock>
						<p className="text-xs text-muted-foreground font-medium mt-1">macOS — Terminal:</p>
						<CodeBlock>{CORS_STEPS.mac.command}</CodeBlock>
						<p className="text-xs text-muted-foreground font-medium mt-1">Linux — Terminal:</p>
						<CodeBlock>{CORS_STEPS.linux.command}</CodeBlock>
					</div>
				)}
			</Step>

			<Step number={4} title="Verify connection">
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
						Could not connect. Is Ollama running and has Step 3 been applied?
					</p>
				)}
			</Step>
		</div>
	);
}

function CloudSetup({ onReady }: { onReady: () => void }) {
	const current = getSettings();
	const [apiKey, setApiKey] = useState(current.cloud.apiKey ?? "");
	const [model, setModel] = useState(current.cloud.model);
	const [baseUrl, setBaseUrl] = useState(current.cloud.baseUrl);
	const [status, setStatus] = useState<"idle" | "checking" | "ok" | "fail">(
		"idle",
	);

	async function test() {
		if (!apiKey.trim()) return;
		setStatus("checking");
		const ok = await checkConnection("", apiKey, baseUrl);
		if (ok) {
			saveSettings({
				...getSettings(),
				mode: "cloud",
				cloud: { ...getSettings().cloud, baseUrl, apiKey, model },
			});
			onReady();
		}
		setStatus(ok ? "ok" : "fail");
	}

	return (
		<div className="flex flex-col gap-7">
			<Step number={1} title="Get an API key">
				<p className="text-sm text-muted-foreground">
					Sign up for an Ollama account to get a cloud API key.
				</p>
				<a
					href="https://ollama.com"
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-1.5 text-sm text-interactive-accent hover:underline mt-2"
				>
					ollama.com
					<ExternalLink size={12} />
				</a>
			</Step>

			<Step number={2} title="Configure your model">
				<div className="flex flex-col gap-3 mt-1">
					<div className="flex flex-col gap-1.5">
						<Label className="text-xs text-muted-foreground">API key</Label>
						<Input
							type="password"
							value={apiKey}
							onChange={(e) => {
								setApiKey(e.target.value);
								setStatus("idle");
							}}
							placeholder="sk-..."
							className="font-mono text-xs"
						/>
					</div>
					<div className="flex flex-col gap-1.5">
						<Label className="text-xs text-muted-foreground">Model</Label>
						<Select
							value={model}
							onValueChange={(v) => {
								if (v) {
									setModel(v);
									setStatus("idle");
								}
							}}
						>
							<SelectTrigger className="text-xs">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>Free</SelectLabel>
									{CLOUD_MODELS.free.map((m) => (
										<SelectItem key={m} value={m} className="font-mono text-xs">
											{m}
										</SelectItem>
									))}
								</SelectGroup>
								<SelectGroup>
									<SelectLabel>Paid</SelectLabel>
									{CLOUD_MODELS.paid.map((m) => (
										<SelectItem key={m} value={m} className="font-mono text-xs">
											{m}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
					<div className="flex flex-col gap-1.5">
						<Label className="text-xs text-muted-foreground">
							API endpoint
						</Label>
						<Input
							value={baseUrl}
							onChange={(e) => {
								setBaseUrl(e.target.value);
								setStatus("idle");
							}}
							className="font-mono text-xs"
							placeholder="https://ollama.com"
						/>
					</div>
				</div>
			</Step>

			<Step number={3} title="Verify connection">
				<p className="text-sm text-muted-foreground mb-2.5">
					Test that your API key works:
				</p>
				<Button
					variant="outline"
					onClick={test}
					disabled={status === "checking" || !apiKey.trim()}
					className="w-full"
				>
					{status === "checking" ? (
						<Loader2 size={14} className="animate-spin mr-2" />
					) : null}
					Test connection
				</Button>
				{status === "ok" && (
					<div className="flex items-center gap-2 mt-3 text-sm text-success">
						<Check size={14} />
						Connected
					</div>
				)}
				{status === "fail" && (
					<p className="mt-3 text-sm text-destructive">
						Could not connect. Check your API key and endpoint.
					</p>
				)}
			</Step>
		</div>
	);
}

export function SetupPage() {
	const navigate = useNavigate();
	const defaultTab = isLocalHost() ? "local" : "cloud";
	const [ready, setReady] = useState(false);

	return (
		<div className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
			<div className="w-full max-w-md">
				<div className="flex justify-center mb-10">
					<AimedLogoFull />
				</div>

				<h1 className="text-lg font-semibold">Get started</h1>
				<p className="text-sm text-muted-foreground mt-1 mb-6">
					Choose how you want to run aimed — locally on your device, or via a
					cloud API.
				</p>

				<Tabs defaultValue={defaultTab} onValueChange={() => setReady(false)}>
					<TabsList className="w-full mb-6">
						<TabsTrigger value="local" className="flex-1 gap-1.5">
							<Monitor size={13} />
							Local
						</TabsTrigger>
						<TabsTrigger value="cloud" className="flex-1 gap-1.5">
							<Cloud size={13} />
							Cloud
						</TabsTrigger>
					</TabsList>

					<TabsContent value="local">
						<LocalSetup onReady={() => setReady(true)} />
					</TabsContent>
					<TabsContent value="cloud">
						<CloudSetup onReady={() => setReady(true)} />
					</TabsContent>
				</Tabs>

				<div className="mt-8 flex flex-col items-center gap-1">
					<Button
						onClick={() => navigate("/chat")}
						disabled={!ready}
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
