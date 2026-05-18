import { BrainCircuit } from "lucide-react";
import { useEffect } from "react";
import {
	Route,
	BrowserRouter as Router,
	Routes,
	useNavigate,
} from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { TooltipProvider } from "@/components/ui/tooltip";
import { checkConnection } from "@/lib/ollama";
import { getSettings } from "@/lib/storage";
import { CasesPage } from "@/pages/CasesPage";
import { ChatPage } from "@/pages/ChatPage";
import { FlashcardsPage } from "@/pages/FlashcardsPage";
import { LandingPage } from "@/pages/LandingPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { SetupPage } from "@/pages/SetupPage";

function InitialRedirect() {
	const navigate = useNavigate();

	useEffect(() => {
		const { ollama } = getSettings();
		checkConnection(ollama.baseUrl).then((ok) => {
			navigate(ok ? "/chat" : "/setup", { replace: true });
		});
	}, [navigate]);

	return (
		<div className="flex h-screen items-center justify-center bg-background">
			<div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
				<BrainCircuit size={18} />
			</div>
		</div>
	);
}

export default function App() {
	return (
		<TooltipProvider>
			<Router>
				<Routes>
					<Route index element={<LandingPage />} />
					<Route path="/app" element={<InitialRedirect />} />
					<Route path="/setup" element={<SetupPage />} />
					<Route element={<Layout />}>
						<Route path="/chat" element={<ChatPage />} />
						<Route path="/flashcards" element={<FlashcardsPage />} />
						<Route path="/cases" element={<CasesPage />} />
						<Route path="/settings" element={<SettingsPage />} />
					</Route>
				</Routes>
			</Router>
		</TooltipProvider>
	);
}
