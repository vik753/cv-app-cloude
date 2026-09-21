import type { Resume } from "@/entities/resume";

export interface Completion {
	filled: number;
	total: number;
	percent: number;
}

/* Lifted out of the page unchanged. 19 is the length of the list below with exactly one
   experience entry; a draft with more entries can push `filled` past it, which is why
   both the count and the percentage are clamped rather than left to run over. */
export function computeCompletion(resume: Resume): Completion {
	const values = [
		resume.name,
		resume.role,
		resume.summary,
		resume.email,
		resume.phone,
		resume.location,
		resume.website,
		resume.github,
		resume.linkedin,
		resume.photo,
		resume.skills.length ? "filled" : "",
		resume.languages.length ? "filled" : "",
		resume.experience.length ? "filled" : "",
		...resume.experience.flatMap((item) => [item.company, item.role, item.period, item.description]),
		resume.education,
		resume.certificates,
	];
	const filled = values.filter(Boolean).length;
	const total = 19;
	return { filled: Math.min(filled, total), total, percent: Math.min(100, Math.round((filled / total) * 100)) };
}
