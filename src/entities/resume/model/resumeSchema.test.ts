import { initialResume } from "@/entities/resume/model/initialResume";
import { experienceSchema, languageLevels, languageSchema, resumeSchema } from "@/entities/resume/model/resumeSchema";
import { describe, expect, it } from "vitest";

const validResume = {
	name: "Alex Smith",
	role: "Frontend Developer",
	email: "alex@example.com",
	phone: "+44 20 0000 0000",
	location: "London",
	website: "alex.dev",
	github: "github.com/alex",
	linkedin: "linkedin.com/in/alex",
	summary: "Builds useful interfaces.",
	skills: ["React"],
	languages: [{ id: 1, language: "English", level: "B2" }],
	experience: [{ id: 1, company: "Studio", role: "Developer", period: "2024", description: "Built products." }],
	education: "Computer Science",
	certificates: "Advanced React",
	photo: "",
};

describe("resumeSchema", () => {
	it("accepts a valid resume", () => {
		expect(resumeSchema.safeParse(validResume).success).toBe(true);
	});

	it("rejects an invalid language level", () => {
		expect(
			resumeSchema.safeParse({ ...validResume, languages: [{ id: 1, language: "English", level: "Z9" }] }).success,
		).toBe(false);
	});

	it("rejects a resume missing a required field entirely", () => {
		const withoutPhone = Object.fromEntries(Object.entries(validResume).filter(([key]) => key !== "phone"));
		expect(resumeSchema.safeParse(withoutPhone).success).toBe(false);
	});

	it("accepts an empty string for free-text fields that carry no format constraint", () => {
		expect(resumeSchema.safeParse({ ...validResume, education: "", certificates: "", website: "" }).success).toBe(true);
	});

	it("accepts an empty skills, languages and experience list", () => {
		expect(resumeSchema.safeParse({ ...validResume, skills: [], languages: [], experience: [] }).success).toBe(true);
	});

	it("accepts an empty email, since this schema validates an autosaved draft that may still be incomplete", () => {
		expect(resumeSchema.safeParse({ ...validResume, email: "" }).success).toBe(true);
	});

	it("still rejects a malformed, non-empty email", () => {
		expect(resumeSchema.safeParse({ ...validResume, email: "not-an-email" }).success).toBe(false);
	});

	it("accepts the app's own blank initial resume", () => {
		/* regression guard for the root cause behind a real bug: initialResume used to
		   fail its own schema (email: "" is not a valid address), which is exactly what
		   made readLegacyDraft's safeParse discard whole legacy drafts on merge - see
		   resumeStore.test.ts. Any future field tightened without checking against
		   initialResume risks reintroducing the same class of bug. */
		expect(resumeSchema.safeParse(initialResume).success).toBe(true);
	});
});

describe("languageSchema", () => {
	it.each(languageLevels)("accepts the %s level", (level) => {
		expect(languageSchema.safeParse({ id: 1, language: "English", level }).success).toBe(true);
	});

	it("rejects a level outside the CEFR + Native set", () => {
		expect(languageSchema.safeParse({ id: 1, language: "English", level: "D1" }).success).toBe(false);
	});
});

describe("experienceSchema", () => {
	it("accepts a fully filled entry", () => {
		expect(
			experienceSchema.safeParse({ id: 1, company: "Acme", role: "Dev", period: "2024", description: "Built it." })
				.success,
		).toBe(true);
	});

	it("rejects an entry with a non-numeric id", () => {
		expect(
			experienceSchema.safeParse({ id: "1", company: "Acme", role: "Dev", period: "2024", description: "" }).success,
		).toBe(false);
	});
});
