import {
	ArrowRight,
	BookOpen,
	Brain,
	ChevronDown,
	Download,
	GitBranch,
	Lock,
	MessageSquare,
	Server,
	Stethoscope,
	Zap,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { AimedLogoCompact, AimedLogoSidebar } from "@/components/layout/AimedLogo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const GITHUB = "https://github.com/ljsalcedo-dev/aimed";
const RELEASES = "https://github.com/ljsalcedo-dev/aimed/releases";

const BRAND_GREEN = "#1D9E75";

function Nav() {
	return (
		<header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-sm">
			<div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
				<Link to="/">
					<AimedLogoCompact iconSize={28} textSize={18} />
				</Link>
				<div className="flex items-center gap-2">
					<a
						href={GITHUB}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						<GitBranch size={15} />
						GitHub
					</a>
					<Link to="/app" className={cn(buttonVariants({ size: "sm" }), "flex items-center gap-1.5 whitespace-nowrap")}>
						Open app
						<ArrowRight size={13} />
					</Link>
				</div>
			</div>
		</header>
	);
}

function Hero() {
	return (
		<section className="mx-auto max-w-5xl px-6 pt-20 pb-16 text-center">
			<div
				className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground mb-8"
				style={{ borderColor: `${BRAND_GREEN}40` }}
			>
				<span
					className="size-1.5 rounded-full"
					style={{ backgroundColor: BRAND_GREEN }}
				/>
				Powered by MedGemma
			</div>

			<h1
				className="text-5xl font-semibold tracking-tight text-foreground mb-5 leading-[1.1]"
				style={{ letterSpacing: "-0.03em" }}
			>
				The AI study tool built
				<br />
				for your medical boards
			</h1>

			<p className="mx-auto max-w-xl text-lg text-muted-foreground mb-8 leading-relaxed">
				Chat, flashcards, and clinical cases — all powered by a medical AI
				model running entirely on your device.
			</p>

			<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
				<Link to="/app" className={cn(buttonVariants({ size: "lg" }), "flex items-center justify-center gap-2 whitespace-nowrap")}>
					Open web app
					<ArrowRight size={15} />
				</Link>
				<a href={RELEASES} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "flex items-center justify-center gap-2 whitespace-nowrap")}>
					<Download size={15} />
					Download desktop app
				</a>
			</div>

			<p className="mt-4 text-xs text-muted-foreground">
				Free and open source &middot; No account required
			</p>
		</section>
	);
}

const FEATURES = [
	{
		icon: MessageSquare,
		title: "Chat",
		description:
			"Ask any question and get expert-level answers from a medical AI. Quiz yourself, explore pathophysiology, or clarify a concept — in plain language or at Step-level depth.",
	},
	{
		icon: BookOpen,
		title: "Flashcards",
		description:
			"Generate cards with AI or write your own. The built-in SM-2 spaced repetition scheduler surfaces cards exactly when you're about to forget them.",
	},
	{
		icon: Stethoscope,
		title: "Clinical Cases",
		description:
			"MedGemma plays the attending. Work through a case, form your differential, and walk through management — with feedback at every step.",
	},
];

function Features() {
	return (
		<section className="mx-auto max-w-5xl px-6 py-16">
			<div className="grid gap-6 sm:grid-cols-3">
				{FEATURES.map(({ icon: Icon, title, description }) => (
					<div
						key={title}
						className="rounded-xl border bg-card p-6 flex flex-col gap-4"
					>
						<div
							className="flex size-9 items-center justify-center rounded-lg"
							style={{ backgroundColor: `${BRAND_GREEN}18` }}
						>
							<Icon size={17} style={{ color: BRAND_GREEN }} />
						</div>
						<div>
							<h3 className="font-semibold text-sm mb-1.5">{title}</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								{description}
							</p>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

const PRIVACY_POINTS = [
	{
		icon: Lock,
		title: "No account, ever",
		body: "There's nothing to sign up for. Open the app and start studying.",
	},
	{
		icon: Server,
		title: "Runs on your machine",
		body: "The AI model runs locally via Ollama — your questions and answers never leave your device.",
	},
	{
		icon: Zap,
		title: "Fast and offline-capable",
		body: "Once the model is pulled, aimed works without an internet connection.",
	},
];

function Privacy() {
	return (
		<section className="border-y bg-muted/40">
			<div className="mx-auto max-w-5xl px-6 py-16">
				<div className="mb-10">
					<h2
						className="text-2xl font-semibold tracking-tight mb-2"
						style={{ letterSpacing: "-0.02em" }}
					>
						Your data never leaves your device
					</h2>
					<p className="text-muted-foreground">
						Most AI study tools send your questions to a remote server. aimed
						doesn't.
					</p>
				</div>
				<div className="grid gap-6 sm:grid-cols-3">
					{PRIVACY_POINTS.map(({ icon: Icon, title, body }) => (
						<div key={title} className="flex flex-col gap-3">
							<Icon size={18} style={{ color: BRAND_GREEN }} />
							<div>
								<p className="text-sm font-semibold mb-1">{title}</p>
								<p className="text-sm text-muted-foreground leading-relaxed">
									{body}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

function MedGemma() {
	return (
		<section className="mx-auto max-w-5xl px-6 py-16">
			<div className="rounded-xl border bg-card overflow-hidden">
				<div className="grid sm:grid-cols-2">
					<div className="p-8 flex flex-col justify-center gap-4">
						<div
							className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
							style={{
								backgroundColor: `${BRAND_GREEN}15`,
								color: BRAND_GREEN,
							}}
						>
							<Brain size={12} />
							MedGemma
						</div>
						<h2
							className="text-2xl font-semibold tracking-tight leading-snug"
							style={{ letterSpacing: "-0.02em" }}
						>
							An AI that understands medicine
						</h2>
						<p className="text-sm text-muted-foreground leading-relaxed">
							MedGemma is Google's open medical AI model, trained on clinical
							literature, medical imaging, and healthcare data. It's purpose-built
							for the kind of questions on Step 1, Step 2, and NCLEX — not
							retrofitted from a general-purpose chatbot.
						</p>
						<p className="text-sm text-muted-foreground leading-relaxed">
							You can also plug in any Ollama-compatible model via the Settings
							page if you prefer something else.
						</p>
					</div>
					<div
						className="flex items-center justify-center p-8 border-t sm:border-t-0 sm:border-l"
						style={{ backgroundColor: `${BRAND_GREEN}08` }}
					>
						<div className="flex flex-col gap-3 w-full max-w-xs">
							{[
								"USMLE Step 1 / Step 2 / Step 3",
								"NCLEX-RN & NCLEX-PN",
								"Internal medicine shelf",
								"COMLEX Level 1 / 2",
							].map((exam) => (
								<div
									key={exam}
									className="flex items-center gap-2.5 text-sm text-muted-foreground"
								>
									<span
										className="size-1.5 rounded-full shrink-0"
										style={{ backgroundColor: BRAND_GREEN }}
									/>
									{exam}
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

const STEPS = [
	{
		n: 1,
		title: "Install Ollama",
		body: "Download Ollama for macOS, Windows, or Linux. It's free and takes about two minutes.",
		link: { label: "ollama.com/download", href: "https://ollama.com/download" },
	},
	{
		n: 2,
		title: "Pull the model",
		body: "Run one command to download MedGemma (~5 GB). Ollama manages the rest.",
		code: "ollama pull medgemma",
	},
	{
		n: 3,
		title: "Start studying",
		body: "Open aimed, complete the one-time connection check, and start your first session.",
		cta: true,
	},
];

function GettingStarted() {
	return (
		<section className="border-t">
			<div className="mx-auto max-w-5xl px-6 py-16">
				<h2
					className="text-2xl font-semibold tracking-tight mb-2"
					style={{ letterSpacing: "-0.02em" }}
				>
					Up and running in minutes
				</h2>
				<p className="text-muted-foreground mb-10">
					No sign-up flow. No waiting for access. Just three steps.
				</p>
				<div className="flex flex-col gap-0">
					{STEPS.map(({ n, title, body, link, code, cta }) => (
						<div key={n} className="flex gap-5 pb-10 last:pb-0 relative">
							<div className="flex flex-col items-center">
								<div
									className="flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white z-10"
									style={{ backgroundColor: BRAND_GREEN }}
								>
									{n}
								</div>
								{n < STEPS.length && (
									<div
										className="w-px flex-1 mt-2"
										style={{ backgroundColor: `${BRAND_GREEN}30` }}
									/>
								)}
							</div>
							<div className="pb-2">
								<p className="text-sm font-semibold mb-1">{title}</p>
								<p className="text-sm text-muted-foreground leading-relaxed mb-2">
									{body}
								</p>
								{link && (
									<a
										href={link.href}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1 text-sm hover:underline"
										style={{ color: BRAND_GREEN }}
									>
										{link.label}
										<ArrowRight size={11} />
									</a>
								)}
								{code && (
									<code className="inline-block rounded-md bg-muted px-3 py-1.5 font-mono text-xs">
										{code}
									</code>
								)}
								{cta && (
									<Link to="/app" className={cn(buttonVariants({ size: "sm" }), "mt-1 flex items-center gap-1.5 whitespace-nowrap")}>
										Open aimed
										<ArrowRight size={13} />
									</Link>
								)}
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

function Footer() {
	return (
		<footer className="border-t">
			<div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
				<AimedLogoCompact iconSize={22} textSize={14} />
				<div className="flex items-center gap-4 text-xs text-muted-foreground">
					<a
						href={GITHUB}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-1.5 hover:text-foreground transition-colors"
					>
						<GitBranch size={13} />
						Open source
					</a>
					<a
						href="https://ljsalcedo.dev"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-foreground transition-colors"
					>
						by ljsalcedo.dev
					</a>
				</div>
			</div>
		</footer>
	);
}

function AppPreview() {
	return (
		<section className="mx-auto max-w-5xl px-6 pb-16">
			<div
				className="rounded-2xl border overflow-hidden"
				style={{ boxShadow: "0 2px 40px oklch(0 0 0 / 0.06)" }}
			>
				{/* Window chrome */}
				<div
					className="h-9 flex items-center gap-3 px-4 border-b shrink-0"
					style={{ background: "oklch(0.985 0 0)" }}
				>
					<div className="flex gap-1.5">
						{(
							[
								"oklch(0.62 0.18 25)",
								"oklch(0.70 0.14 75)",
								"oklch(0.62 0.17 145)",
							] as const
						).map((bg) => (
							<span
								key={bg}
								className="size-2.5 rounded-full"
								style={{ background: bg }}
							/>
						))}
					</div>
					<span className="text-xs" style={{ color: "oklch(0.65 0 0)" }}>
						aimed
					</span>
				</div>

				{/* App body */}
				<div className="flex" style={{ height: "320px" }}>
					{/* Sidebar */}
					<div
						className="hidden sm:flex w-44 shrink-0 border-r flex-col p-2 gap-0.5"
						style={{ background: "oklch(0.985 0 0)" }}
					>
						<div className="px-2 py-2.5 mb-1">
							<AimedLogoSidebar />
						</div>
						{[
							{ icon: MessageSquare, label: "Chat", active: true },
							{ icon: BookOpen, label: "Flashcards", active: false },
							{ icon: Stethoscope, label: "Cases", active: false },
						].map(({ icon: Icon, label, active }) => (
							<div
								key={label}
								className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs"
								style={{
									background: active ? "oklch(0.97 0 0)" : "transparent",
									color: active
										? "oklch(0.145 0 0)"
										: "oklch(0.556 0 0)",
									fontWeight: active ? 500 : 400,
								}}
							>
								<Icon size={12} />
								{label}
							</div>
						))}
					</div>

					{/* Chat area */}
					<div className="flex-1 flex flex-col min-w-0 bg-background">
						<div className="flex-1 p-5 flex flex-col gap-4 overflow-hidden">
							{/* User bubble */}
							<div className="flex justify-end">
								<div
									className="max-w-xs px-3.5 py-2.5 text-xs leading-relaxed"
									style={{
										background: "oklch(0.205 0 0)",
										color: "oklch(1 0 0)",
										borderRadius: "1.125rem 0.25rem 1.125rem 1.125rem",
									}}
								>
									What&apos;s the mechanism of beta-1 blockers on cardiac
									output?
								</div>
							</div>

							{/* AI bubble */}
							<div className="flex gap-2.5 items-start">
								<div
									className="size-6 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold"
									style={{
										background: "oklch(0.205 0 0)",
										color: "oklch(1 0 0)",
									}}
								>
									M
								</div>
								<div
									className="flex-1 px-3.5 py-2.5 text-xs leading-relaxed min-w-0"
									style={{
										background: "oklch(0.97 0 0)",
										borderRadius: "0.25rem 1.125rem 1.125rem 1.125rem",
										color: "oklch(0.205 0 0)",
									}}
								>
									<p>
										Beta-1 blockers competitively antagonize catecholamines at
										&beta;1-adrenergic receptors in the SA node and myocardium,
										reducing cAMP signaling throughout.
									</p>
									<div
										className="mt-2 flex flex-col gap-1"
										style={{ color: "oklch(0.42 0 0)" }}
									>
										<span>
											&mdash; Negative chronotropy: &darr; I
											<sub>f</sub> current &rarr; slower SA node firing
										</span>
										<span>
											&mdash; Negative inotropy: &darr; L-type Ca&sup2;&plus;
											influx during phase 2
										</span>
										<span>
											&mdash; Net: lower cardiac output, &darr; myocardial O
											<sub>2</sub> demand
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Input mock */}
						<div className="p-3 border-t">
							<div
								className="flex items-center gap-2 rounded-lg border px-3.5 py-2"
								style={{ background: "oklch(0.985 0 0)" }}
							>
								<span
									className="flex-1 text-xs"
									style={{ color: "oklch(0.65 0 0)" }}
								>
									Ask a question...
								</span>
								<div
									className="size-6 rounded flex items-center justify-center shrink-0"
									style={{ background: "oklch(0.205 0 0)" }}
								>
									<ArrowRight size={11} color="white" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<p className="mt-3 text-center text-xs text-muted-foreground">
				Chat &middot; Flashcards &middot; Clinical Cases
			</p>
		</section>
	);
}

const FAQS = [
	{
		q: "What hardware do I need?",
		a: "Ollama recommends at least 8 GB of RAM for MedGemma's 4B model. A dedicated GPU (NVIDIA or Apple Silicon) speeds things up noticeably, but the CPU works fine for studying. A laptop from the last four or five years is usually sufficient.",
	},
	{
		q: "Does aimed work on Windows and Linux?",
		a: "Yes. The web app runs in any modern browser. The desktop build follows Ollama's platform support: macOS (Apple Silicon and Intel), Windows 10 and 11, and most Linux distributions. See ollama.com for the full install guide.",
	},
	{
		q: "Can I use a different AI model?",
		a: "Yes — any Ollama-compatible model works. Open Settings in the app and change the model name. Llama 3, Mistral, Gemma, and others all run fine. MedGemma is the default because it's trained on clinical literature and handles exam-style questions better than general-purpose models.",
	},
	{
		q: "What happens if I clear my browser data?",
		a: "Your flashcard decks, session history, and settings are stored in your browser's localStorage. Clearing site data or using a private window will erase them. Export your decks from the Flashcards page before clearing if you want to keep them.",
	},
	{
		q: "Is aimed free to use?",
		a: "Yes — aimed is free and open source under the MIT license. There's no paid tier, no usage cap, and no account. You can fork it, self-host it, or contribute on GitHub.",
	},
];

function FAQ() {
	const [open, setOpen] = useState<number | null>(null);

	return (
		<section className="border-t">
			<div className="mx-auto max-w-5xl px-6 py-16">
				<h2
					className="text-2xl font-semibold tracking-tight mb-2"
					style={{ letterSpacing: "-0.02em" }}
				>
					Common questions
				</h2>
				<p className="text-muted-foreground mb-10">
					Everything you need before your first session.
				</p>

				<div className="flex flex-col divide-y">
					{FAQS.map(({ q, a }, i) => (
						<div key={q}>
							<button
								type="button"
								onClick={() => setOpen(open === i ? null : i)}
								className="flex w-full items-center justify-between py-4 text-left text-sm font-medium hover:text-foreground transition-colors"
							>
								<span>{q}</span>
								<ChevronDown
									size={15}
									className="shrink-0 ml-4 text-muted-foreground transition-transform duration-200"
									style={{
										transform:
											open === i ? "rotate(180deg)" : "rotate(0deg)",
									}}
								/>
							</button>
							{open === i && (
								<p className="pb-5 text-sm text-muted-foreground leading-relaxed max-w-2xl">
									{a}
								</p>
							)}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

function FinalCTA() {
	return (
		<section
			className="border-t"
			style={{ background: "oklch(0.145 0 0)" }}
		>
			<div className="mx-auto max-w-5xl px-6 py-16 flex flex-col items-center text-center gap-6">
				<div
					className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
					style={{
						borderColor: `${BRAND_GREEN}40`,
						color: BRAND_GREEN,
					}}
				>
					<span
						className="size-1.5 rounded-full"
						style={{ backgroundColor: BRAND_GREEN }}
					/>
					Ready when you are
				</div>

				<h2
					className="text-3xl font-semibold tracking-tight text-white leading-tight max-w-md"
					style={{ letterSpacing: "-0.025em" }}
				>
					Open aimed and start your next session.
				</h2>

				<p className="text-sm max-w-sm leading-relaxed" style={{ color: "oklch(0.60 0 0)" }}>
					No account, no subscription. Install Ollama, pull the model, and
					you&apos;re studying.
				</p>

				<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mt-1 w-full sm:w-auto">
					<Link
						to="/app"
						className={cn(buttonVariants({ size: "lg" }), "flex items-center justify-center gap-2 whitespace-nowrap")}
						style={{
							background: "oklch(0.94 0 0)",
							color: "oklch(0.145 0 0)",
							borderColor: "transparent",
						}}
					>
						Open web app
						<ArrowRight size={15} />
					</Link>
					<a
						href={RELEASES}
						target="_blank"
						rel="noopener noreferrer"
						className={cn(buttonVariants({ variant: "outline", size: "lg" }), "flex items-center justify-center gap-2 whitespace-nowrap")}
						style={{
							borderColor: "oklch(0.38 0 0)",
							color: "oklch(0.72 0 0)",
							background: "transparent",
						}}
					>
						<Download size={15} />
						Download desktop app
					</a>
				</div>
			</div>
		</section>
	);
}

export function LandingPage() {
	return (
		<div className="min-h-screen bg-background">
			<Nav />
			<Hero />
			<AppPreview />
			<Features />
			<Privacy />
			<MedGemma />
			<GettingStarted />
			<FAQ />
			<FinalCTA />
			<Footer />
		</div>
	);
}
