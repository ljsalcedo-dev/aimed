import {
	BookOpen,
	Cloud,
	FlaskConical,
	MessageSquare,
	Settings,
	Stethoscope,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { getSettings } from "@/lib/storage";
import { AimedLogoSidebar } from "./AimedLogo";

const NAV = [
	{ to: "/chat", icon: MessageSquare, label: "Chat" },
	{ to: "/flashcards", icon: BookOpen, label: "Flashcards" },
	{ to: "/cases", icon: Stethoscope, label: "Cases" },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
	const [settings, setSettings] = useState(getSettings);

	useEffect(() => {
		const refresh = () => setSettings(getSettings());
		window.addEventListener("aimed:settings-changed", refresh);
		return () => window.removeEventListener("aimed:settings-changed", refresh);
	}, []);

	const isCloud = settings.mode === "cloud";
	const model = isCloud ? settings.cloud.model : settings.ollama.model;

	return (
		<aside className="flex h-full w-56 flex-col border-r bg-sidebar">
			{/* Brand */}
			<div className="flex items-center px-4 py-4 border-b">
				<AimedLogoSidebar />
			</div>

			{/* Navigation */}
			<nav className="flex flex-col gap-1 p-2 flex-1">
				<p className="px-2 pt-2 pb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
					Study
				</p>
				{NAV.map(({ to, icon: Icon, label }) => (
					<NavLink
						key={to}
						to={to}
						onClick={onClose}
						className={({ isActive }) =>
							cn(
								"flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
								isActive
									? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
									: "text-sidebar-foreground hover:bg-sidebar-accent/60",
							)
						}
					>
						<Icon size={16} />
						{label}
					</NavLink>
				))}

				<div className="mt-auto">
					<NavLink
						to="/settings"
						onClick={onClose}
						className={({ isActive }) =>
							cn(
								"flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
								isActive
									? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
									: "text-sidebar-foreground hover:bg-sidebar-accent/60",
							)
						}
					>
						<Settings size={16} />
						Settings
					</NavLink>
				</div>
			</nav>

			{/* Model status */}
			<div className="flex items-center gap-2 px-4 py-3 border-t min-w-0">
				{isCloud ? (
					<Cloud size={14} className="text-muted-foreground shrink-0" />
				) : (
					<FlaskConical size={14} className="text-muted-foreground shrink-0" />
				)}
				<div className="flex flex-col min-w-0">
					<span className="text-xs text-muted-foreground leading-none">
						{isCloud ? "Cloud" : "Local"}
					</span>
					<span className="text-xs text-muted-foreground/60 truncate leading-none mt-0.5">
						{model}
					</span>
				</div>
			</div>
		</aside>
	);
}
