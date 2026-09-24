import { App } from "@/app";
import { initialResume, useResumeStore } from "@/entities/resume";
import { renderWithProviders as render } from "@/test-utils/renderWithProviders";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

/* A high-level smoke test: App wires together the store, the scene, the form and
   the preview. This does not re-check any of their own behaviour (covered in their
   own test files); it only checks that the wiring itself does not fall over when a
   user walks the three entry states every session passes through. */
describe("App", () => {
	let printSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		localStorage.clear();
		/* an empty draft and no stored preference is precisely a first-time visitor */
		useResumeStore.setState({ resume: initialResume, palette: "cream", mode: "light" });
		printSpy = vi.spyOn(window, "print").mockImplementation(() => {});
	});

	/* welcome → scene → form, the walk a first-time visitor makes before the form exists */
	const enterForm = async (user: ReturnType<typeof userEvent.setup>) => {
		await user.click(screen.getByRole("button", { name: /welcome to the not boring cv/i }));
		await user.click(screen.getByRole("button", { name: /start building your cv/i }));
	};

	it("opens on the welcome screen for a first-time visitor", () => {
		render(<App />);
		expect(screen.getByRole("button", { name: /welcome to the not boring cv/i })).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /download pdf/i })).not.toBeInTheDocument();
	});

	it("walks from the welcome screen through the scene into the form", async () => {
		const user = userEvent.setup();
		render(<App />);
		await user.click(screen.getByRole("button", { name: /welcome to the not boring cv/i }));
		/* the scene now has the screen to itself: the form is unmounted, not hidden */
		expect(screen.getByRole("button", { name: /start building your cv/i })).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /download pdf/i })).not.toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: /start building your cv/i }));
		expect(screen.getByRole("button", { name: /download pdf/i })).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
	});

	it("offers to continue rather than to start once the form has been seen", async () => {
		const user = userEvent.setup();
		render(<App />);
		await enterForm(user);
		await user.click(screen.getByRole("button", { name: /back to the scene/i }));
		expect(screen.getByRole("button", { name: /continue cv/i })).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /start building your cv/i })).not.toBeInTheDocument();
	});

	it("opens straight in the form for someone whose draft is already saved", () => {
		useResumeStore.setState({ resume: { ...initialResume, name: "Ada Lovelace" } });
		render(<App />);
		expect(screen.getByRole("button", { name: /download pdf/i })).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /welcome to the not boring cv/i })).not.toBeInTheDocument();
	});

	/* the switch predates the entry flow: whoever turned the background off is not
	   dropped onto a scene, even with nothing typed yet */
	it("opens straight in the form for someone who switched the scene off, draft or not", () => {
		localStorage.setItem("resume-canvas-scene", "off");
		render(<App />);
		expect(screen.getByRole("button", { name: /download pdf/i })).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /welcome to the not boring cv/i })).not.toBeInTheDocument();
	});

	it("remembers the scene as off once the form is open, and as on once back on the scene", async () => {
		const user = userEvent.setup();
		render(<App />);
		await enterForm(user);
		expect(localStorage.getItem("resume-canvas-scene")).toBe("off");
		await user.click(screen.getByRole("button", { name: /back to the scene/i }));
		expect(localStorage.getItem("resume-canvas-scene")).toBe("on");
	});

	it("shows and hides the live preview", async () => {
		const user = userEvent.setup();
		render(<App />);
		await enterForm(user);
		/* the preview stays mounted (its CSS handles hiding it); the toggle button's
		   own state is the accessible signal of whether it is currently shown */
		const toggle = screen.getByRole("button", { name: /show preview/i });
		expect(toggle).toHaveAttribute("aria-expanded", "false");
		await user.click(toggle);
		expect(screen.getByRole("button", { name: /hide preview/i })).toHaveAttribute("aria-expanded", "true");
		await user.click(screen.getByRole("button", { name: /hide preview/i }));
		expect(screen.getByRole("button", { name: /show preview/i })).toHaveAttribute("aria-expanded", "false");
	});

	it("prints the resume through window.print when Download is clicked", async () => {
		const user = userEvent.setup();
		render(<App />);
		await enterForm(user);
		await user.click(screen.getByRole("button", { name: /download pdf/i }));
		expect(printSpy).toHaveBeenCalledTimes(1);
	});

	it("switches between light and dark mode", async () => {
		const user = userEvent.setup();
		render(<App />);
		await enterForm(user);
		/* the sky no longer drives the mode, so the switch is live at all times */
		const darkButton = screen.getByRole("button", { name: "Dark" });
		expect(darkButton).toBeEnabled();
		await user.click(darkButton);
		expect(darkButton).toHaveClass("active");
	});
});
