import { App } from "@/App";
import { TooltipProvider } from "@/shared/ui";
import "@/app/styles/index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<TooltipProvider delayDuration={250}>
			<App />
		</TooltipProvider>
	</StrictMode>,
);
