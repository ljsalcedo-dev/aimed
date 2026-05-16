import { Check, Copy, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { checkConnection, listModels } from "@/lib/ollama";
import { getSettings, getStats, saveSettings } from "@/lib/storage";
import type { AppSettings, ModelMode } from "@/types";

function CopyBlock({ children }: { children: string }) {
	const [copied, setCopied] = useState(false);
	function copy() {
		navigator.clipboard.writeText(children);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}
	return (
		<div className="flex items-center justify-between gap-3 rounded-md bg-muted px-3 py-2">
			<code className="font-mono text-xs">{children}</code>
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

export function SettingsPage() {
	const [settings, setSettings] = useState<AppSettings>(() => getSettings());
	const [models, setModels] = useState<string[]>([]);
	const [cloudModels, setCloudModels] = useState<string[]>([]);
	const [connected, setConnected] = useState<boolean | null>(null);
	const [checking, setChecking] = useState(false);
	const [cloudConnected, setCloudConnected] = useState<boolean | null>(null);
	const [cloudChecking, setCloudChecking] = useState(false);
	const [saved, setSaved] = useState(false);
	const stats = getStats();

	const testLocalConnection = useCallback(async () => {
		setChecking(true);
		setConnected(null);
		const ok = await checkConnection(settings.ollama.baseUrl);
		setConnected(ok);
		if (ok) {
			const list = await listModels(settings.ollama.baseUrl);
			setModels(list);
		}
		setChecking(false);
	}, [settings.ollama.baseUrl]);

	const testCloudConnection = useCallback(async () => {
		if (!settings.cloud.baseUrl) return;
		setCloudChecking(true);
		setCloudConnected(null);
		const ok = await checkConnection(settings.cloud.baseUrl, settings.cloud.apiKey);
		setCloudConnected(ok);
		if (ok) {
			const list = await listModels(settings.cloud.baseUrl, settings.cloud.apiKey);
			setCloudModels(list);
		}
		setCloudChecking(false);
	}, [settings.cloud.baseUrl, settings.cloud.apiKey]);

	useEffect(() => {
		testLocalConnection();
	}, [testLocalConnection]);

	function save() {
		saveSettings(settings);
		setSaved(true);
		setTimeout(() => setSaved(false), 2000);
	}

	function patch(path: string, value: string | number) {
		setSettings((prev) => {
			const next = structuredClone(prev);
			const keys = path.split(".");
			// biome-ignore lint/suspicious/noExplicitAny: dynamic path patching
			let obj: any = next;
			for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
			obj[keys[keys.length - 1]] = value;
			return next;
		});
	}

	function setMode(mode: ModelMode) {
		setSettings((prev) => ({ ...prev, mode }));
	}

	// Ensure the saved AppSettings always has cloud/mode fields (migration for existing data)
	const safeSettings = {
		...settings,
		mode: settings.mode ?? "local",
		cloud: settings.cloud ?? { baseUrl: "", model: "", temperature: 0.7, apiKey: "" },
	};

	return (
		<div className="flex flex-1 flex-col overflow-auto">
			<div className="border-b px-6 py-4">
				<h1 className="font-semibold text-lg">Settings</h1>
			</div>

			<div className="flex flex-col gap-6 p-6 max-w-2xl">
				{/* Model source */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Model source</CardTitle>
					</CardHeader>
					<CardContent>
						<Tabs
							value={safeSettings.mode}
							onValueChange={(v) => setMode(v as ModelMode)}
						>
							<TabsList className="w-full">
								<TabsTrigger value="local" className="flex-1">
									Local (Ollama)
								</TabsTrigger>
								<TabsTrigger value="cloud" className="flex-1">
									Cloud
								</TabsTrigger>
							</TabsList>

							{/* ── Local tab ── */}
							<TabsContent value="local" className="flex flex-col gap-4 mt-4">
								<p className="text-sm text-muted-foreground">
									Runs fully on your device. Requires Ollama installed on a
									desktop or a machine on your network.
								</p>

								<Separator />

								{/* Quick setup */}
								<div className="flex flex-col gap-3 text-sm">
									<p className="font-medium">Quick setup</p>
									<div className="flex flex-col gap-1">
										<p className="text-muted-foreground">1. Install Ollama</p>
										<a
											href="https://ollama.com/download"
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-xs"
										>
											ollama.com/download <ExternalLink size={11} />
										</a>
									</div>
									<div className="flex flex-col gap-1.5">
										<p className="text-muted-foreground">2. Pull the model (~5 GB)</p>
										<CopyBlock>{`ollama pull ${safeSettings.ollama.model}`}</CopyBlock>
										<p className="text-xs text-muted-foreground">
											If Ollama doesn't start automatically, also run{" "}
											<code className="font-mono bg-muted px-1 py-0.5 rounded">
												ollama serve
											</code>
										</p>
									</div>
								</div>

								<Separator />

								{/* Connection */}
								<div className="flex items-end gap-3">
									<div className="flex-1 flex flex-col gap-1.5">
										<Label>Base URL</Label>
										<Input
											value={safeSettings.ollama.baseUrl}
											onChange={(e) => patch("ollama.baseUrl", e.target.value)}
											placeholder="http://localhost:11434"
										/>
									</div>
									<Button
										variant="outline"
										onClick={testLocalConnection}
										disabled={checking}
										className="shrink-0"
									>
										{checking ? (
											<Loader2 size={14} className="animate-spin mr-2" />
										) : (
											<RefreshCw size={14} className="mr-2" />
										)}
										Test
									</Button>
								</div>

								{connected !== null && (
									<div
										className={`flex items-center gap-2 text-sm ${connected ? "text-success" : "text-destructive"}`}
									>
										{connected ? <Check size={14} /> : <span>✗</span>}
										{connected
											? "Connected to Ollama"
											: "Cannot connect — is Ollama running?"}
									</div>
								)}

								<div className="flex flex-col gap-1.5">
									<Label>Model</Label>
									{models.length > 0 ? (
										<Select
											value={safeSettings.ollama.model}
											onValueChange={(v) => patch("ollama.model", v ?? "")}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{models.map((m) => (
													<SelectItem key={m} value={m}>
														{m}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									) : (
										<Input
											value={safeSettings.ollama.model}
											onChange={(e) => patch("ollama.model", e.target.value)}
											placeholder="medgemma"
										/>
									)}
								</div>

								<div className="flex flex-col gap-1.5">
									<Label>Temperature ({safeSettings.ollama.temperature})</Label>
									<input
										type="range"
										min="0"
										max="1"
										step="0.05"
										value={safeSettings.ollama.temperature}
										onChange={(e) =>
											patch("ollama.temperature", parseFloat(e.target.value))
										}
										className="w-full"
									/>
									<div className="flex justify-between text-xs text-muted-foreground">
										<span>Precise (0)</span>
										<span>Creative (1)</span>
									</div>
								</div>
							</TabsContent>

							{/* ── Cloud tab ── */}
							<TabsContent value="cloud" className="flex flex-col gap-4 mt-4">
								<p className="text-sm text-muted-foreground">
									Run models on Ollama Cloud — no local GPU required. API keys
									are stored only in your browser.
								</p>

								<Separator />

								<div className="flex flex-col gap-1.5">
									<Label>API Key</Label>
									<Input
										type="password"
										value={safeSettings.cloud.apiKey ?? ""}
										onChange={(e) => patch("cloud.apiKey", e.target.value)}
										placeholder="ollama_..."
										autoComplete="off"
									/>
									<a
										href="https://ollama.com/settings/api-keys"
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
									>
										Get an API key at ollama.com <ExternalLink size={11} />
									</a>
								</div>

								<div className="flex items-end gap-3">
									<div className="flex-1 flex flex-col gap-1.5">
										<Label>Host</Label>
										<Input
											value={safeSettings.cloud.baseUrl}
											onChange={(e) => patch("cloud.baseUrl", e.target.value)}
											placeholder="https://ollama.com"
										/>
									</div>
									<Button
										variant="outline"
										onClick={testCloudConnection}
										disabled={cloudChecking || !safeSettings.cloud.apiKey}
										className="shrink-0"
									>
										{cloudChecking ? (
											<Loader2 size={14} className="animate-spin mr-2" />
										) : (
											<RefreshCw size={14} className="mr-2" />
										)}
										Test
									</Button>
								</div>

								{cloudConnected !== null && (
									<div
										className={`flex items-center gap-2 text-sm ${cloudConnected ? "text-success" : "text-destructive"}`}
									>
										{cloudConnected ? <Check size={14} /> : <span>✗</span>}
										{cloudConnected
											? "Connected to Ollama Cloud"
											: "Cannot connect — check the host and API key"}
									</div>
								)}

								<div className="flex flex-col gap-1.5">
									<Label>Model</Label>
									{cloudModels.length > 0 ? (
										<Select
											value={safeSettings.cloud.model}
											onValueChange={(v) => patch("cloud.model", v ?? "")}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{cloudModels.map((m) => (
													<SelectItem key={m} value={m}>
														{m}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									) : (
										<Input
											value={safeSettings.cloud.model}
											onChange={(e) => patch("cloud.model", e.target.value)}
											placeholder="e.g. gemma3:27b-cloud"
										/>
									)}
								</div>

								<div className="flex flex-col gap-1.5">
									<Label>Temperature ({safeSettings.cloud.temperature})</Label>
									<input
										type="range"
										min="0"
										max="1"
										step="0.05"
										value={safeSettings.cloud.temperature}
										onChange={(e) =>
											patch("cloud.temperature", parseFloat(e.target.value))
										}
										className="w-full"
									/>
									<div className="flex justify-between text-xs text-muted-foreground">
										<span>Precise (0)</span>
										<span>Creative (1)</span>
									</div>
								</div>
							</TabsContent>
						</Tabs>
					</CardContent>
				</Card>

				{/* Study stats */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Study statistics</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 gap-4">
							{[
								{
									label: "Flashcards reviewed",
									value: stats.totalFlashcardsReviewed,
								},
								{ label: "Cases completed", value: stats.totalCasesCompleted },
								{ label: "Chat messages", value: stats.totalChatMessages },
								{
									label: "Last studied",
									value: stats.lastStudied
										? new Date(stats.lastStudied).toLocaleDateString()
										: "—",
								},
							].map(({ label, value }) => (
								<div key={label} className="flex flex-col gap-0.5">
									<p className="text-xs text-muted-foreground">{label}</p>
									<p className="font-semibold">{value}</p>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* About */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">About</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
						<div className="flex items-center gap-2">
							<span>aimed</span>
							<Badge variant="secondary">v0.1.0</Badge>
						</div>
						<p>
							AI-powered medical exam review. Local mode uses MedGemma via
							Ollama. All data is stored locally in your browser.
						</p>
					</CardContent>
				</Card>

				<Button onClick={save} className="w-fit">
					{saved ? (
						<>
							<Check size={14} className="mr-2" />
							Saved
						</>
					) : (
						"Save settings"
					)}
				</Button>
			</div>
		</div>
	);
}
