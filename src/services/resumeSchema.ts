import { z } from "zod";

export const experienceSchema = z.object({
	id: z.number(),
	company: z.string(),
	role: z.string(),
	period: z.string(),
	description: z.string(),
});

export const languageLevels = ["A1", "A2", "B1", "B2", "C1", "C2", "Native"] as const;

export const languageSchema = z.object({
	id: z.number(),
	language: z.string(),
	level: z.enum(languageLevels),
});

export const resumeSchema = z.object({
	name: z.string(),
	role: z.string(),
	email: z.string().email(),
	phone: z.string(),
	location: z.string(),
	website: z.string(),
	github: z.string(),
	linkedin: z.string(),
	summary: z.string(),
	skills: z.array(z.string()),
	languages: z.array(languageSchema),
	experience: z.array(experienceSchema),
	education: z.string(),
	certificates: z.string(),
	photo: z.string(),
});

export type Resume = z.infer<typeof resumeSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type LanguageEntry = z.infer<typeof languageSchema>;
export type LanguageLevel = (typeof languageLevels)[number];
export type ResumeField = Exclude<keyof Resume, "skills" | "experience" | "languages">;
export type ExperienceField = keyof Omit<Experience, "id">;
