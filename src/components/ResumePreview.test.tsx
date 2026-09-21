import { ResumePreview } from "@/components/ResumePreview";
import { translations } from "@/shared/i18n";
import { initialResume } from "@/entities/resume/model/initialResume";
import type { Resume } from "@/entities/resume/model/resumeSchema";
import { renderWithProviders as render } from "@/test-utils/renderWithProviders";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

const t = translations.en;

const filledResume: Resume = {
	...initialResume,
	name: "Jamie Doe",
	role: "Backend Developer",
	email: "jamie@example.com",
	skills: ["Go", "Docker"],
	languages: [{ id: 1, language: "English", level: "C1" }],
	experience: [{ id: 1, company: "Acme", role: "Engineer", period: "2021 - Present", description: "Built things." }],
	education: "BSc Computer Science",
	certificates: "AWS Certified",
};

describe("ResumePreview", () => {
	it("shows placeholder copy for an empty resume", () => {
		render(<ResumePreview resume={initialResume} t={t} language='en' />);
		expect(screen.getByText(t.previewName)).toBeInTheDocument();
		expect(screen.getByText(t.previewRole)).toBeInTheDocument();
		expect(screen.getByText(t.previewSummary)).toBeInTheDocument();
	});

	it("reflects the resume's own data once it is filled in", () => {
		render(<ResumePreview resume={filledResume} t={t} language='en' />);
		expect(screen.getByText("Jamie Doe")).toBeInTheDocument();
		expect(screen.getByText("Backend Developer")).toBeInTheDocument();
		expect(screen.getByText("Go")).toBeInTheDocument();
		expect(screen.getByText("Docker")).toBeInTheDocument();
		expect(screen.getByText("English C1")).toBeInTheDocument();
		expect(screen.getByText("Acme")).toBeInTheDocument();
		expect(screen.getByText("BSc Computer Science")).toBeInTheDocument();
		expect(screen.getByText("AWS Certified")).toBeInTheDocument();
	});

	it("does not render a languages block when there are no languages", () => {
		render(<ResumePreview resume={{ ...filledResume, languages: [] }} t={t} language='en' />);
		expect(screen.queryByText(t.languages)).not.toBeInTheDocument();
	});

	it("zooms in and out within the 80-100% bounds", async () => {
		const user = userEvent.setup();
		render(<ResumePreview resume={filledResume} t={t} language='en' />);
		expect(screen.getByText("92%")).toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: t.zoomIn }));
		expect(screen.getByText("96%")).toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: t.zoomIn }));
		expect(screen.getByText("100%")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: t.zoomIn })).toBeDisabled();
	});

	it("stops zooming out at 80%", async () => {
		const user = userEvent.setup();
		render(<ResumePreview resume={filledResume} t={t} language='en' />);
		for (let i = 0; i < 5; i += 1) {
			await user.click(screen.getByRole("button", { name: t.zoomOut }));
		}
		expect(screen.getByText("80%")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: t.zoomOut })).toBeDisabled();
	});
});
