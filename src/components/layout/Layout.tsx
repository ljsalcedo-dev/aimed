import { BrainCircuit, Menu } from "lucide-react";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";

export function Layout() {
	const [open, setOpen] = useState(false);

	return (
		<div className="flex h-screen overflow-hidden bg-background">
			{/* Desktop sidebar */}
			<div className="hidden md:flex">
				<Sidebar />
			</div>

			{/* Mobile sidebar sheet */}
			<Sheet open={open} onOpenChange={setOpen}>
				<SheetContent side="left" className="p-0 w-56">
					<Sidebar onClose={() => setOpen(false)} />
				</SheetContent>
			</Sheet>

			<div className="flex flex-1 flex-col overflow-hidden min-w-0">
				{/* Mobile top bar */}
				<div className="flex items-center gap-3 border-b px-4 py-3 md:hidden shrink-0">
					<button
						type="button"
						onClick={() => setOpen(true)}
						className="text-muted-foreground hover:text-foreground transition-colors"
						aria-label="Open menu"
					>
						<Menu size={20} />
					</button>
					<div className="flex items-center gap-2">
						<div className="flex size-6 items-center justify-center rounded-md bg-sidebar-accent text-sidebar-accent-foreground">
							<BrainCircuit size={13} />
						</div>
						<span className="font-semibold text-sm">aimed</span>
					</div>
				</div>

				<main className="flex flex-1 flex-col overflow-hidden min-w-0">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
