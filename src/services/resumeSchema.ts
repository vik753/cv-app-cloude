import { z } from "zod";

export const experienceSchema = z.object({
	id: z.number(),
	company: z.string(),
	role: z.string(),
	period: z.string(),
	description: z.string(),
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
	experience: z.array(experienceSchema),
	education: z.string(),
	certificates: z.string(),
	photo: z.string(),
});

export type Resume = z.infer<typeof resumeSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type ResumeField = Exclude<keyof Resume, "skills" | "experience">;
export type ExperienceField = keyof Omit<Experience, "id">;
