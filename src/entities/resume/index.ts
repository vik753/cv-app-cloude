/* The resume draft, the schema it is validated against, and the two lookup tables the
   form's autocomplete offers. Kept inside: the icon id resolver behind getSkillIconUrl,
   the per-field schemas, and the store's localStorage readers — nothing outside asks
   for them, and the persistence keys are a contract with real drafts. */
export { initialResume, createEmptyExperience } from "@/entities/resume/model/initialResume";
export { resumeSchema, languageLevels } from "@/entities/resume/model/resumeSchema";
export type { Experience, ExperienceField, Resume, ResumeField } from "@/entities/resume/model/resumeSchema";
export { isMode, isPalette, useResumeStore } from "@/entities/resume/model/resumeStore";
export type { Mode, Palette } from "@/entities/resume/model/resumeStore";
export { getSkillIconUrl, skillIconSuggestions } from "@/entities/resume/lib/skillIcons";
export { languageSuggestions } from "@/entities/resume/config/languageSuggestions";
export { SkillIcon } from "@/entities/resume/ui/SkillIcon";
