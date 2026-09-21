import { PaletteSwitcher } from "@/features/palette-switch";
import { translations } from "@/shared/i18n";
import { renderWithProviders as render } from "@/test-utils/renderWithProviders";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const t = translations.en;

describe("PaletteSwitcher", () => {
	it("opens the menu and lists all three palettes", async () => {
		const user = userEvent.setup();
		render(<PaletteSwitcher palette='cream' t={t} onChange={vi.fn()} />);
		await user.click(screen.getByRole("button", { name: t.palette }));
		expect(await screen.findByRole("menuitemradio", { name: new RegExp(t.themeBlurpleName) })).toBeInTheDocument();
		expect(screen.getByRole("menuitemradio", { name: new RegExp(t.themeCreamName) })).toBeInTheDocument();
		expect(screen.getByRole("menuitemradio", { name: new RegExp(t.themeSlateName) })).toBeInTheDocument();
	});

	it("marks the current palette as checked", async () => {
		const user = userEvent.setup();
		render(<PaletteSwitcher palette='slate' t={t} onChange={vi.fn()} />);
		await user.click(screen.getByRole("button", { name: t.palette }));
		expect(await screen.findByRole("menuitemradio", { name: new RegExp(t.themeSlateName) })).toHaveAttribute(
			"aria-checked",
			"true",
		);
	});

	it("reports the chosen palette when a different one is picked", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(<PaletteSwitcher palette='cream' t={t} onChange={onChange} />);
		await user.click(screen.getByRole("button", { name: t.palette }));
		await user.click(await screen.findByRole("menuitemradio", { name: new RegExp(t.themeBlurpleName) }));
		expect(onChange).toHaveBeenCalledWith("blurple");
	});
});
