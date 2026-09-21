import { ResumeForm } from "@/components/ResumeForm";
import { translations } from "@/shared/i18n";
import { initialResume } from "@/entities/resume/model/initialResume";
import type { ExperienceField, Resume, ResumeField } from "@/entities/resume/model/resumeSchema";
import { renderWithProviders as render } from "@/test-utils/renderWithProviders";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

const t = translations.en;

/* ResumeForm is a controlled component: it reports every change upward and expects
   the caller to feed the new `resume` back in, exactly like `App` wires it to the
   Zustand store. This wrapper plays that role so the tests exercise the same
   contract a real screen does, not a mocked-out shortcut. */
function ControlledResumeForm({ initial }: { initial?: Partial<Resume> }) {
	const [resume, setResume] = useState<Resume>({ ...initialResume, ...initial });
	return (
		<ResumeForm
			resume={resume}
			t={t}
			onChange={(field: ResumeField, value: string) => setResume((current) => ({ ...current, [field]: value }))}
			onExperienceChange={(id: number, field: ExperienceField, value: string) =>
				setResume((current) => ({
					...current,
					experience: current.experience.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
				}))
			}
			onResumeChange={(updater) => setResume(updater)}
		/>
	);
}

describe("ResumeForm - field input", () => {
	it("reports a keystroke in the name field to the caller", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(
			<ResumeForm
				resume={initialResume}
				t={t}
				onChange={onChange}
				onExperienceChange={vi.fn()}
				onResumeChange={vi.fn()}
			/>,
		);
		await user.type(screen.getByLabelText(t.name), "Alex");
		expect(onChange).toHaveBeenLastCalledWith("name", "Alex");
	});

	it("keeps a typed value visible after the caller feeds it back as the new resume", async () => {
		const user = userEvent.setup();
		render(<ControlledResumeForm />);
		const nameField = screen.getByLabelText(t.name);
		await user.type(nameField, "Anna");
		expect(nameField).toHaveValue("Anna");
	});
});

describe("ResumeForm - validation", () => {
	it("surfaces a validation error once an invalid email is entered and the field is left", async () => {
		const user = userEvent.setup();
		render(<ControlledResumeForm />);
		const emailField = screen.getByLabelText(t.email);
		await user.type(emailField, "not-an-email");
		await user.tab();
		expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
	});

	it("shows no validation error for a well-formed email", async () => {
		const user = userEvent.setup();
		render(<ControlledResumeForm />);
		const emailField = screen.getByLabelText(t.email);
		await user.type(emailField, "person@example.com");
		await user.tab();
		expect(screen.queryByText(/invalid email/i)).not.toBeInTheDocument();
	});

	it("shows no validation error for a still-empty email, since an incomplete draft is not an invalid one", async () => {
		const user = userEvent.setup();
		render(<ControlledResumeForm />);
		await user.click(screen.getByLabelText(t.email));
		await user.tab();
		expect(screen.queryByText(/invalid email/i)).not.toBeInTheDocument();
	});
});

describe("ResumeForm - work experience", () => {
	it("adds a new, empty workplace entry", async () => {
		const user = userEvent.setup();
		render(<ControlledResumeForm />);
		expect(screen.queryAllByLabelText(t.company)).toHaveLength(0);
		await user.click(screen.getByRole("button", { name: t.addWork }));
		expect(screen.getAllByLabelText(t.company)).toHaveLength(1);
	});

	it("removes a workplace entry", async () => {
		const user = userEvent.setup();
		render(
			<ControlledResumeForm
				initial={{
					experience: [
						{ id: 1, company: "Acme", role: "Dev", period: "2020", description: "" },
						{ id: 2, company: "Globex", role: "Lead", period: "2022", description: "" },
					],
				}}
			/>,
		);
		expect(screen.getAllByDisplayValue(/Acme|Globex/)).toHaveLength(2);
		const removeButtons = screen.getAllByRole("button", { name: t.remove });
		/* the last two "remove" buttons on the page belong to the two experience
		   cards; the skill/language chip removers come first when no skills/languages
		   are present, so with an empty resume these are the only "remove" buttons */
		await user.click(removeButtons[0]);
		expect(screen.getAllByDisplayValue(/Acme|Globex/)).toHaveLength(1);
	});
});

describe("ResumeForm - skills", () => {
	it("adds a typed skill that has no icon suggestion on submit", async () => {
		const user = userEvent.setup();
		render(<ControlledResumeForm />);
		await user.type(screen.getByPlaceholderText(t.addSkill), "Leadership");
		await user.click(screen.getByRole("button", { name: t.addSkill }));
		expect(screen.getByText("Leadership")).toBeInTheDocument();
		expect(screen.getByPlaceholderText(t.addSkill)).toHaveValue("");
	});

	it("removes a skill chip", async () => {
		const user = userEvent.setup();
		render(<ControlledResumeForm initial={{ skills: ["Communication"] }} />);
		const chip = screen.getByText("Communication").closest("span")!;
		await user.click(within(chip).getByRole("button", { name: t.remove }));
		expect(screen.queryByText("Communication")).not.toBeInTheDocument();
	});

	it("does not add the same skill twice", async () => {
		const user = userEvent.setup();
		render(<ControlledResumeForm initial={{ skills: ["Leadership"] }} />);
		await user.type(screen.getByPlaceholderText(t.addSkill), "Leadership");
		await user.click(screen.getByRole("button", { name: t.addSkill }));
		expect(screen.getAllByText("Leadership")).toHaveLength(1);
	});

	it("navigates the skill autocomplete with the keyboard and adds the highlighted suggestion", async () => {
		const user = userEvent.setup();
		render(<ControlledResumeForm />);
		const skillInput = screen.getByPlaceholderText(t.addSkill);
		/* "vue" matches both the "Vue" and "Vuetify" skillicons.dev suggestions */
		await user.type(skillInput, "vue");
		const suggestions = await screen.findByRole("button", { name: /^Vue$/ });
		expect(suggestions).toBeInTheDocument();
		await user.keyboard("{ArrowDown}{Enter}");
		expect(screen.getByText("Vuetify")).toBeInTheDocument();
		expect(screen.queryByText(/^Vue$/)).not.toBeInTheDocument();
	});
});

describe("ResumeForm - languages", () => {
	it("adds a language with its level", async () => {
		const user = userEvent.setup();
		render(<ControlledResumeForm />);
		await user.type(screen.getByLabelText(t.languageLabel), "German");
		await user.selectOptions(screen.getByLabelText(t.levelLabel), "C1");
		await user.click(screen.getByRole("button", { name: t.addLanguage }));
		expect(screen.getByText("German C1")).toBeInTheDocument();
	});

	it("removes a language chip", async () => {
		const user = userEvent.setup();
		render(<ControlledResumeForm initial={{ languages: [{ id: 1, language: "French", level: "B1" }] }} />);
		const chip = screen.getByText("French B1").closest("span")!;
		await user.click(within(chip).getByRole("button", { name: t.remove }));
		expect(screen.queryByText("French B1")).not.toBeInTheDocument();
	});
});
