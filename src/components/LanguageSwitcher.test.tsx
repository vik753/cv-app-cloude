import { LanguageSwitcher } from "@/features/language-switch";
import { translations } from "@/shared/i18n";
import { renderWithProviders as render } from "@/test-utils/renderWithProviders";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const t = translations.en;

describe("LanguageSwitcher", () => {
	it("shows both language options", () => {
		render(<LanguageSwitcher language='en' t={t} onChange={vi.fn()} />);
		expect(screen.getByRole("button", { name: "EN" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "УКР" })).toBeInTheDocument();
	});

	it("marks the active language distinctly from the inactive one", () => {
		render(<LanguageSwitcher language='uk' t={t} onChange={vi.fn()} />);
		expect(screen.getByRole("button", { name: "УКР" })).toHaveClass("active");
		expect(screen.getByRole("button", { name: "EN" })).not.toHaveClass("active");
	});

	it("reports the picked language", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(<LanguageSwitcher language='en' t={t} onChange={onChange} />);
		await user.click(screen.getByRole("button", { name: "УКР" }));
		expect(onChange).toHaveBeenCalledWith("uk");
	});
});
