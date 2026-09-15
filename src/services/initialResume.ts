import type { Resume } from "@/services/resumeSchema";

export const createEmptyExperience = (): Resume["experience"][number] => ({
	id: Date.now(),
	company: "",
	role: "",
	period: "",
	description: "",
});

export const initialResume: Resume = {
	name: "Alex Smith",
	role: "Frontend Developer",
	email: "alexey.smirnov@mail.com",
	phone: "+7 999 123-45-67",
	location: "London, UK",
	website: "alexey.dev",
	github: "github.com/alexsmith",
	linkedin: "linkedin.com/in/alexsmith",
	summary: "I create fast, clear interfaces and turn complex problems into thoughtful digital products.",
	skills: ["React", "TypeScript", "Figma", "Node.js"],
	experience: [
		{
			id: 1,
			company: "Northstar Studio",
			role: "Frontend Developer",
			period: "2022 — now",
			description: "Built product interfaces and a scalable design system for a B2B SaaS platform.",
		},
	],
	education: "University of Manchester · Computer Science · 2018",
	certificates: "Frontend Masters · Advanced React Patterns · 2023",
	photo: "",
};
