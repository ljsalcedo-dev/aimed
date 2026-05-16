import {
	BookOpen,
	BrainCircuit,
	FlaskConical,
	MessageSquare,
	Settings,
	Stethoscope,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const NAV = [
	{ to: "/chat", icon: MessageSquare, label: "Chat" },
	{ to: "/flashcards", icon: BookOpen, label: "Flashcards" },
	{ to: "/cases", icon: Stethoscope, label: "Cases" },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
	return (
		<aside className="flex h-full w-56 flex-col border-r bg-sidebar">
			{/* Brand */}
			<div className="flex items-center gap-2.5 px-4 py-5 border-b">
				<div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
					<BrainCircuit size={18} />
				</div>
				<div className="leading-none">
					<p className="font-semibold text-sm text-sidebar-foreground">aimed</p>
					<p className="text-xs text-muted-foreground">Medical Review App using MedGemma AI Model</p>
				</div>
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

			{/* Status dot */}
			<div className="flex items-center gap-2 px-4 py-3 border-t">
				<FlaskConical size={14} className="text-muted-foreground" />
				<span className="text-xs text-muted-foreground">MedGemma 1.5</span>
			</div>
		</aside>
	);
}
