import { App } from "@/App";
import { useResumeStore } from "@/entities/resume/model/resumeStore";
import { renderWithProviders as render } from "@/test-utils/renderWithProviders";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

/* A high-level smoke test: App wires together the store, the scene, the form and
   the preview. This does not re-check any of their own behaviour (covered in their
   own test files); it only checks that the wiring itself does not fall over when a
   user flips the switches every session touches. */
describe("App", () => {
	let printSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		localStorage.clear();
		useResumeStore.setState({ palette: "cream", mode: "light" });
		printSpy = vi.spyOn(window, "print").mockImplementation(() => {});
	});

	it("renders the builder shell", () => {
		render(<App />);
		expect(screen.getByRole("button", { name: /download pdf/i })).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
	});

	it("toggles the scene on and off", async () => {
		const user = userEvent.setup();
		render(<App />);
		const sceneToggle = screen.getByRole("button", { name: /turn off animated background/i });
		expect(sceneToggle).toHaveAttribute("aria-pressed", "true");
		await user.click(sceneToggle);
		expect(screen.getByRole("button", { name: /turn on animated background/i })).toHaveAttribute(
			"aria-pressed",
			"false",
		);
	});

	it("shows and hides the live preview", async () => {
		const user = userEvent.setup();
		render(<App />);
		/* the preview stays mounted (its CSS handles hiding it); the toggle button's
		   own state is the accessible signal of whether it is currently shown */
		const toggle = screen.getByRole("button", { name: /show preview/i });
		expect(toggle).toHaveAttribute("aria-expanded", "false");
		await user.click(toggle);
		expect(screen.getByRole("button", { name: /hide preview/i })).toHaveAttribute("aria-expanded", "true");
		await user.click(screen.getByRole("button", { name: /hide preview/i }));
		expect(screen.getByRole("button", { name: /show preview/i })).toHaveAttribute("aria-expanded", "false");
	});

	it("minimizes the window and can be restored again", async () => {
		const user = userEvent.setup();
		render(<App />);
		await user.click(screen.getByRole("button", { name: /minimize/i }));
		const restoreButton = await screen.findByRole("button", { name: /restore/i });
		expect(restoreButton).toBeInTheDocument();
		await user.click(restoreButton);
		expect(screen.queryByRole("button", { name: /restore/i })).not.toBeInTheDocument();
	});

	it("prints the resume through window.print when Download is clicked", async () => {
		const user = userEvent.setup();
		render(<App />);
		await user.click(screen.getByRole("button", { name: /download pdf/i }));
		expect(printSpy).toHaveBeenCalledTimes(1);
	});

	it("switches between light and dark mode once the scene is off", async () => {
		const user = userEvent.setup();
		render(<App />);
		/* the light/dark buttons are disabled while the animated scene drives mode itself */
		await user.click(screen.getByRole("button", { name: /turn off animated background/i }));
		const darkButton = screen.getByRole("button", { name: "Dark" });
		expect(darkButton).toBeEnabled();
		await user.click(darkButton);
		expect(darkButton).toHaveClass("active");
	});
});
