import type { Resume } from "@/entities/resume/model/resumeSchema";

export const createEmptyExperience = (): Resume["experience"][number] => ({
	id: Date.now(),
	company: "",
	role: "",
	period: "",
	description: "",
});

export const initialResume: Resume = {
	name: "",
	role: "",
	email: "",
	phone: "",
	location: "",
	website: "",
	github: "",
	linkedin: "",
	summary: "",
	skills: [],
	languages: [],
	experience: [],
	education: "",
	certificates: "",
	photo: "",
};
