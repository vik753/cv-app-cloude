import { useResumeStore } from "@/entities/resume";
import { printFileName } from "@/pages/builder/lib/printFileName";
import { useEffect } from "react";

/* The title is swapped for the length of a print and put back after it. Listening for
   the print itself rather than wrapping the Download button is what covers ⌘P too, and
   the name is read at that moment, not captured, so it is always the one on the page. */
export function usePrintFileName() {
	useEffect(() => {
		let saved: string | null = null;
		const before = () => {
			saved = document.title;
			document.title = printFileName(useResumeStore.getState().resume.name);
		};
		const after = () => {
			if (saved === null) return;
			document.title = saved;
			saved = null;
		};
		window.addEventListener("beforeprint", before);
		window.addEventListener("afterprint", after);
		return () => {
			after();
			window.removeEventListener("beforeprint", before);
			window.removeEventListener("afterprint", after);
		};
	}, []);
}
