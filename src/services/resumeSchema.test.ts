import { resumeSchema } from "@/services/resumeSchema";
import { describe, expect, it } from "vitest";

const validResume = {
	name: "Alex Smith",
	role: "Frontend Developer",
	email: "alex@example.com",
	phone: "+44 20 0000 0000",
	location: "London",
	website: "alex.dev",
	summary: "Builds useful interfaces.",
	skills: ["React"],
	experience: [{ id: 1, company: "Studio", role: "Developer", period: "2024", description: "Built products." }],
	education: "Computer Science",
	certificates: "Advanced React",
	photo: "",
};

describe("resumeSchema", () => {
	it("accepts a valid resume", () => {
		expect(resumeSchema.safeParse(validResume).success).toBe(true);
	});

	it("rejects an invalid email", () => {
		expect(resumeSchema.safeParse({ ...validResume, email: "invalid" }).success).toBe(false);
	});
});
