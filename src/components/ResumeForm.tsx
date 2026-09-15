import { SkillIcon } from "@/components/SkillIcon";
import type { Translation } from "@/services/copy";
import { createEmptyExperience } from "@/services/initialResume";
import { resumeSchema, type ExperienceField, type Resume, type ResumeField } from "@/services/resumeSchema";
import { getSkillIconUrl, skillIconSuggestions } from "@/services/skillIcons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Plus, Trash, X } from "@phosphor-icons/react";
import type { ChangeEvent, FormEvent, KeyboardEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

interface ResumeFormProps {
	resume: Resume;
	t: Translation;
	onChange: (field: ResumeField, value: string) => void;
	onExperienceChange: (id: number, field: ExperienceField, value: string) => void;
	onResumeChange: (updater: (current: Resume) => Resume) => void;
}

const inputClass =
	"w-full rounded border border-[#d0d4cb] bg-white/30 px-3 py-2.5 text-[13px] text-[#1d2924] outline-none transition focus:border-[#538375] focus:bg-[#fbfbf8] focus:ring-4 focus:ring-[#538375]/10";

export function ResumeForm({ resume, t, onChange, onExperienceChange, onResumeChange }: ResumeFormProps) {
	const [newSkill, setNewSkill] = useState("");
	const [highlightedSkill, setHighlightedSkill] = useState(0);
	const {
		register,
		formState: { errors },
	} = useForm<Resume>({ resolver: zodResolver(resumeSchema), values: resume, mode: "onBlur" });
	const bind = (field: ResumeField) => {
		const registered = register(field);
		return {
			...registered,
			onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
				registered.onChange(event);
				onChange(field, event.target.value);
			},
		};
	};
	const skillSuggestions = useMemo(() => {
		const query = newSkill.trim().toLowerCase();
		if (!query) return [];
		return skillIconSuggestions
			.filter(({ label, id }) => `${label} ${id}`.toLowerCase().includes(query) && !resume.skills.includes(label))
			.slice(0, 6);
	}, [newSkill, resume.skills]);
	const addSkillValue = (value: string) => {
		const trimmedValue = value.trim();
		if (trimmedValue && !resume.skills.includes(trimmedValue)) {
			onResumeChange((current) => ({ ...current, skills: [...current.skills, trimmedValue] }));
			setNewSkill("");
			setHighlightedSkill(0);
		}
	};
	const addSkill = (event: FormEvent) => {
		event.preventDefault();
		addSkillValue(newSkill);
	};
	const selectSkillSuggestion = (label: string) => {
		addSkillValue(label);
	};
	const handleSkillKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (!skillSuggestions.length) return;
		if (event.key === "ArrowDown") {
			event.preventDefault();
			setHighlightedSkill((current) => (current + 1) % skillSuggestions.length);
		}
		if (event.key === "ArrowUp") {
			event.preventDefault();
			setHighlightedSkill((current) => (current - 1 + skillSuggestions.length) % skillSuggestions.length);
		}
		if (event.key === "Enter") {
			event.preventDefault();
			selectSkillSuggestion(skillSuggestions[highlightedSkill].label);
		}
	};
	const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => onChange("photo", String(reader.result));
		reader.readAsDataURL(file);
	};
	const section = "border-b border-[#d7d8d0] py-8";
	return (
		<div className='pt-2'>
			<section className={section}>
				<SectionHeading number='01' title={t.profile} hint={t.profileHint} />
				<div className='grid gap-6 md:grid-cols-[115px_1fr]'>
					<label className='flex w-[115px] cursor-pointer flex-col items-center text-center'>
						<input className='hidden' type='file' accept='image/*' onChange={handlePhoto} />
						<span className='mb-2 grid h-[82px] w-[82px] shrink-0 place-items-center overflow-hidden rounded-full bg-[#e4d3be] text-[27px] text-[#d36f48]'>
							{resume.photo ? (
								<img
									className='h-full w-full object-cover'
									src={resume.photo}
									alt={t.photoAdded}
									width='82'
									height='82'
									loading='lazy'
								/>
							) : (
								<Camera size={20} />
							)}
						</span>
						<strong className='text-[11px] text-[#30423b]'>{resume.photo ? t.photoAdded : t.photo}</strong>
						<small className='mt-1 text-[9px] text-[#98a19a]'>{t.photoHint}</small>
					</label>
					<div className='grid gap-4 sm:grid-cols-2'>
						<Field label={t.name} error={errors.name?.message}>
							<input className={inputClass} placeholder={t.namePlaceholder} {...bind("name")} />
						</Field>
						<Field label={t.position}>
							<input className={inputClass} placeholder={t.jobPlaceholder} {...bind("role")} />
						</Field>
						<Field className='sm:col-span-2' label={t.about}>
							<textarea className={inputClass} rows={3} {...bind("summary")} />
						</Field>
					</div>
				</div>
			</section>
			<section className={section}>
				<SectionHeading number='02' title={t.contacts} hint={t.contactsHint} />
				<div className='grid gap-4 sm:grid-cols-2'>
					<Field label={t.email} error={errors.email?.message}>
						<input className={inputClass} type='email' {...bind("email")} />
					</Field>
					<Field label={t.phone}>
						<input className={inputClass} {...bind("phone")} />
					</Field>
					<Field label={t.city}>
						<input className={inputClass} {...bind("location")} />
					</Field>
					<Field label={t.website}>
						<input className={inputClass} {...bind("website")} />
					</Field>
					<Field label={t.github}>
						<input className={inputClass} {...bind("github")} />
					</Field>
					<Field label={t.linkedin}>
						<input className={inputClass} {...bind("linkedin")} />
					</Field>
				</div>
			</section>
			<section className={section}>
				<SectionHeading number='03' title={t.skills} hint={t.skillsHint} />
				<div className='flex flex-wrap gap-2'>
					{resume.skills.map((skill) => (
						<button
							className='flex items-center gap-2 rounded-full border border-[#ccd8ce] bg-[#eaf0e8] py-1.5 pl-1.5 pr-2.5 text-[11px] text-[#2d4b40]'
							type='button'
							key={skill}
							onClick={() =>
								onResumeChange((current) => ({ ...current, skills: current.skills.filter((item) => item !== skill) }))
							}
						>
							<SkillIcon skill={skill} />
							{!getSkillIconUrl(skill) ? (
								<span className='grid h-5 w-5 place-items-center rounded-full bg-[#d36f48] font-mono text-[10px] text-[#f9f7ef]'>
									{skill.slice(0, 1)}
								</span>
							) : null}
							{skill}
							<X size={15} className='text-[var(--chip-x)]' />
						</button>
					))}
				</div>
				<form className='relative mt-4 flex w-[250px]' onSubmit={addSkill}>
					<div className='relative min-w-0 flex-1'>
						<input
							className={`${inputClass} rounded-r-none border-r-0`}
							value={newSkill}
							onChange={(event) => {
								setNewSkill(event.target.value);
								setHighlightedSkill(0);
							}}
							onKeyDown={handleSkillKeyDown}
							placeholder={t.addSkill}
							aria-autocomplete='list'
							aria-controls='skill-suggestions'
						/>
						{skillSuggestions.length ? (
							<div
								id='skill-suggestions'
								className='absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded border border-[#d0d4cb] bg-[#fbfaf5] shadow-lg'
							>
								{skillSuggestions.map(({ id, label }, index) => (
									<button
										className={`flex w-full items-center gap-2 px-2 py-2 text-left text-[11px] text-[#2d4b40] ${index === highlightedSkill ? "bg-[#e8eee7]" : "hover:bg-[#f1f3ed]"}`}
										key={id}
										type='button'
										onMouseDown={(event) => event.preventDefault()}
										onClick={() => selectSkillSuggestion(label)}
									>
										<SkillIcon skill={label} className='h-5 w-5' />
										{label}
									</button>
								))}
							</div>
						) : null}
					</div>
					<button
						className='w-10 rounded-r border border-[#d0d4cb] text-[#153b34]'
						type='submit'
						aria-label={t.addSkill}
					>
						<Plus size={17} />
					</button>
				</form>
			</section>
			<section className={section}>
				<SectionHeading number='04' title={t.experience} hint={t.experienceHint} />
				{resume.experience.map((item) => (
					<div className='mb-3 border border-[#d5d8d0] bg-white/20 p-4' key={item.id}>
						<div className='grid gap-4 sm:grid-cols-2'>
							<Field label={t.company}>
								<input
									className={inputClass}
									value={item.company}
									onChange={(event) => onExperienceChange(item.id, "company", event.target.value)}
								/>
							</Field>
							<Field label={t.jobTitle}>
								<input
									className={inputClass}
									value={item.role}
									onChange={(event) => onExperienceChange(item.id, "role", event.target.value)}
								/>
							</Field>
							<Field label={t.period}>
								<input
									className={inputClass}
									value={item.period}
									onChange={(event) => onExperienceChange(item.id, "period", event.target.value)}
								/>
							</Field>
							<Field className='sm:col-span-2' label={t.achievements}>
								<textarea
									className={inputClass}
									rows={2}
									value={item.description}
									onChange={(event) => onExperienceChange(item.id, "description", event.target.value)}
								/>
							</Field>
						</div>
						<button
							className='pt-2 text-[11px] text-[#bb684d]'
							type='button'
							onClick={() =>
								onResumeChange((current) => ({
									...current,
									experience: current.experience.filter((experience) => experience.id !== item.id),
								}))
							}
						>
							<Trash size={14} className='mr-1 inline' />
							{t.remove}
						</button>
					</div>
				))}
				<button
					className='text-xs text-[#477668]'
					type='button'
					onClick={() =>
						onResumeChange((current) => ({ ...current, experience: [...current.experience, createEmptyExperience()] }))
					}
				>
					<Plus size={15} className='mr-1 inline' /> {t.addWork}
				</button>
			</section>
			<section className={section}>
				<SectionHeading number='05' title={t.degree} hint={t.educationHint} />
				<div className='grid gap-4'>
					<Field label={t.degree}>
						<textarea className={inputClass} rows={2} {...bind("education")} />
					</Field>
				</div>
			</section>
			<section className={section}>
				<SectionHeading number='06' title={t.certificates} hint={t.certificates} />
				<div className='grid gap-4'>
					<Field label={t.certificates}>
						<textarea className={inputClass} rows={2} {...bind("certificates")} />
					</Field>
				</div>
			</section>
		</div>
	);
}

function SectionHeading({ number, title, hint }: { number: string; title: string; hint: string }) {
	return (
		<div className='mb-6 flex items-start gap-4'>
			<span className='pt-1 font-mono text-[11px] tracking-[.08em] text-[#d36f48]'>{number}</span>
			<div>
				<h2 className='font-display text-xl font-semibold tracking-tight text-[#153b34]'>{title}</h2>
				<p className='mt-1 text-xs text-[#849089]'>{hint}</p>
			</div>
		</div>
	);
}
function Field({
	label,
	className,
	error,
	children,
}: {
	label: string;
	className?: string;
	error?: string;
	children: ReactNode;
}) {
	return (
		<label className={`grid gap-2 text-[11px] text-[#66716b] ${className ?? ""}`}>
			{label}
			{children}
			{error ? <span className='text-[10px] text-[#bb684d]'>{error}</span> : null}
		</label>
	);
}
