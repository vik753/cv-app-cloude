import { Tooltip } from "@/shared/ui";
import type { Translation } from "@/shared/i18n";
import {
	createEmptyExperience,
	getSkillIconUrl,
	languageLevels,
	languageSuggestions,
	resumeSchema,
	SkillIcon,
	skillIconSuggestions,
	type ExperienceField,
	type Resume,
	type ResumeField,
} from "@/entities/resume";
import { shrinkPhoto } from "@/features/resume-form/lib/photo";
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
	const [newLanguage, setNewLanguage] = useState("");
	const [newLanguageLevel, setNewLanguageLevel] = useState<(typeof languageLevels)[number]>(languageLevels[0]);
	const [highlightedLanguage, setHighlightedLanguage] = useState(0);
	const [showLanguageSuggestions, setShowLanguageSuggestions] = useState(false);
	const {
		register,
		formState: { errors },
	} = useForm<Resume>({ resolver: zodResolver(resumeSchema), values: resume, mode: "onBlur" });
	const bind = (field: ResumeField) => {
		const registered = register(field);
		return {
			...registered,
			onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
				/* RHF's onChange starts validation and resolves later; the draft has to be
				   updated on this same keystroke, so the promise is fired and not awaited. */
				void registered.onChange(event);
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
	const languageAutocomplete = useMemo(() => {
		const query = newLanguage.trim().toLowerCase();
		if (!query) return [];
		const addedLanguages = resume.languages.map((entry) => entry.language.toLowerCase());
		return languageSuggestions
			.filter((label) => label.toLowerCase().includes(query) && !addedLanguages.includes(label.toLowerCase()))
			.slice(0, 6);
	}, [newLanguage, resume.languages]);
	const addLanguageValue = (value: string) => {
		const trimmedLanguage = value.trim();
		if (!trimmedLanguage) return;
		const alreadyAdded = resume.languages.some(
			(entry) => entry.language.toLowerCase() === trimmedLanguage.toLowerCase(),
		);
		if (alreadyAdded) return;
		onResumeChange((current) => ({
			...current,
			languages: [...current.languages, { id: Date.now(), language: trimmedLanguage, level: newLanguageLevel }],
		}));
		setNewLanguage("");
		setNewLanguageLevel(languageLevels[0]);
		setHighlightedLanguage(0);
		setShowLanguageSuggestions(false);
	};
	const addLanguage = (event: FormEvent) => {
		event.preventDefault();
		addLanguageValue(newLanguage);
	};
	const selectLanguageSuggestion = (label: string) => {
		setNewLanguage(label);
		setHighlightedLanguage(0);
		setShowLanguageSuggestions(false);
	};
	const handleLanguageKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (!showLanguageSuggestions || !languageAutocomplete.length) return;
		if (event.key === "ArrowDown") {
			event.preventDefault();
			setHighlightedLanguage((current) => (current + 1) % languageAutocomplete.length);
		}
		if (event.key === "ArrowUp") {
			event.preventDefault();
			setHighlightedLanguage((current) => (current - 1 + languageAutocomplete.length) % languageAutocomplete.length);
		}
		if (event.key === "Enter") {
			event.preventDefault();
			selectLanguageSuggestion(languageAutocomplete[highlightedLanguage]);
		}
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
	const [photoFailed, setPhotoFailed] = useState(false);
	const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
		const input = event.target;
		const file = input.files?.[0];
		if (!file) return;
		/* cleared so choosing the same file again after a failure still fires a change */
		input.value = "";
		shrinkPhoto(file).then(
			(photo) => {
				setPhotoFailed(false);
				onChange("photo", photo);
			},
			() => setPhotoFailed(true),
		);
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
						{photoFailed ? (
							<small className='mt-1 text-[9px] text-[var(--danger-text)]' role='alert'>
								{t.photoError}
							</small>
						) : (
							<small className='mt-1 text-[9px] text-[#98a19a]'>{t.photoHint}</small>
						)}
					</label>
					<div className='grid gap-4 sm:grid-cols-2'>
						<Field label={t.name} error={errors.name?.message}>
							<input className={inputClass} placeholder={t.namePlaceholder} {...bind("name")} />
						</Field>
						<Field label={t.position}>
							<input className={inputClass} placeholder={t.jobPlaceholder} {...bind("role")} />
						</Field>
						<Field className='sm:col-span-2' label={t.about}>
							<textarea className={inputClass} rows={3} placeholder={t.summaryPlaceholder} {...bind("summary")} />
						</Field>
					</div>
				</div>
			</section>
			<section className={section}>
				<SectionHeading number='02' title={t.contacts} hint={t.contactsHint} />
				<div className='grid gap-4 sm:grid-cols-2'>
					<Field label={t.email} error={errors.email?.message}>
						<input className={inputClass} type='email' placeholder={t.emailPlaceholder} {...bind("email")} />
					</Field>
					<Field label={t.phone}>
						<input className={inputClass} placeholder={t.phonePlaceholder} {...bind("phone")} />
					</Field>
					<Field label={t.city}>
						<input className={inputClass} placeholder={t.locationPlaceholder} {...bind("location")} />
					</Field>
					<Field label={t.website}>
						<input className={inputClass} placeholder={t.websitePlaceholder} {...bind("website")} />
					</Field>
					<Field label={t.github}>
						<input className={inputClass} placeholder={t.githubPlaceholder} {...bind("github")} />
					</Field>
					<Field label={t.linkedin}>
						<input className={inputClass} placeholder={t.linkedinPlaceholder} {...bind("linkedin")} />
					</Field>
				</div>
			</section>
			<section className={section}>
				<SectionHeading number='03' title={t.skills} hint={t.skillsHint} />
				<div className='flex flex-wrap gap-2'>
					{resume.skills.map((skill) => (
						<span
							className='flex items-center gap-2 rounded-full border border-[#ccd8ce] bg-[#eaf0e8] py-1.5 pl-1.5 pr-2.5 text-[11px] text-[#2d4b40]'
							key={skill}
						>
							<SkillIcon skill={skill} />
							{!getSkillIconUrl(skill) ? (
								<span className='grid h-5 w-5 place-items-center rounded-full bg-[#d36f48] font-mono text-[10px] text-[#f9f7ef]'>
									{skill.slice(0, 1)}
								</span>
							) : null}
							{skill}
							<Tooltip label={t.remove}>
								<button
									className='chip-remove -m-0.5 grid place-items-center rounded-full p-0.5 transition duration-150 hover:rotate-90'
									type='button'
									aria-label={t.remove}
									onClick={() =>
										onResumeChange((current) => ({
											...current,
											skills: current.skills.filter((item) => item !== skill),
										}))
									}
								>
									<X size={15} />
								</button>
							</Tooltip>
						</span>
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
										className={`flex w-full items-center gap-2 px-2 py-2 text-left text-[11px] text-[#2d4b40] ${index === highlightedSkill ? "bg-[var(--tint)]" : "hover:bg-[var(--tint)]"}`}
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
					<Tooltip label={t.addSkill}>
						<button
							className='grid w-10 shrink-0 place-items-center rounded-r border border-[#d0d4cb] text-[#153b34] transition hover:bg-[var(--tint)]'
							type='submit'
							aria-label={t.addSkill}
						>
							<Plus size={17} />
						</button>
					</Tooltip>
				</form>
				<div className='mt-6 border-t border-[var(--divider)] pt-5'>
					<h3 className='mb-3 text-[11px] font-semibold uppercase tracking-[.06em] text-[#66716b]'>{t.languages}</h3>
					<div className='flex flex-wrap gap-2'>
						{resume.languages.map((entry) => (
							<span
								className='flex items-center gap-2 rounded-full border border-[var(--lang-chip-border)] bg-[var(--lang-tint)] py-1.5 pl-3 pr-2.5 text-[11px] text-[var(--lang-on-tint)]'
								key={entry.id}
							>
								{entry.language} {entry.level}
								<Tooltip label={t.remove}>
									<button
										className='chip-remove -m-0.5 grid place-items-center rounded-full p-0.5 transition duration-150 hover:rotate-90'
										type='button'
										aria-label={t.remove}
										onClick={() =>
											onResumeChange((current) => ({
												...current,
												languages: current.languages.filter((item) => item.id !== entry.id),
											}))
										}
									>
										<X size={15} />
									</button>
								</Tooltip>
							</span>
						))}
					</div>
					<form className='relative mt-4 flex w-[280px]' onSubmit={addLanguage}>
						<div className='relative min-w-0 flex-1'>
							<input
								className={`${inputClass} rounded-r-none border-r-0`}
								value={newLanguage}
								onChange={(event) => {
									setNewLanguage(event.target.value);
									setHighlightedLanguage(0);
									setShowLanguageSuggestions(true);
								}}
								onKeyDown={handleLanguageKeyDown}
								onBlur={() => setShowLanguageSuggestions(false)}
								placeholder={t.languagePlaceholder}
								aria-label={t.languageLabel}
								aria-autocomplete='list'
								aria-controls='language-suggestions'
							/>
							{showLanguageSuggestions && languageAutocomplete.length ? (
								<div
									id='language-suggestions'
									className='absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded border border-[#d0d4cb] bg-[#fbfaf5] shadow-lg'
								>
									{languageAutocomplete.map((label, index) => (
										<button
											className={`block w-full px-2 py-2 text-left text-[11px] text-[#2d4b40] ${index === highlightedLanguage ? "bg-[var(--lang-tint)]" : "hover:bg-[var(--lang-tint)]"}`}
											key={label}
											type='button'
											onMouseDown={(event) => event.preventDefault()}
											onClick={() => selectLanguageSuggestion(label)}
										>
											{label}
										</button>
									))}
								</div>
							) : null}
						</div>
						<div className='w-[84px] shrink-0'>
							<Tooltip label={t.levelLabel}>
								<select
									className={`${inputClass} rounded-none border-r-0 px-2`}
									value={newLanguageLevel}
									onChange={(event) => setNewLanguageLevel(event.target.value as (typeof languageLevels)[number])}
									aria-label={t.levelLabel}
								>
									{languageLevels.map((level) => (
										<option key={level} value={level}>
											{level}
										</option>
									))}
								</select>
							</Tooltip>
						</div>
						<Tooltip label={t.addLanguage}>
							<button
								className='grid w-10 shrink-0 place-items-center rounded-r border border-[#d0d4cb] text-[#153b34] transition hover:bg-[var(--lang-tint)]'
								type='submit'
								aria-label={t.addLanguage}
							>
								<Plus size={17} />
							</button>
						</Tooltip>
					</form>
				</div>
			</section>
			<section className={section}>
				<SectionHeading number='04' title={t.experience} hint={t.experienceHint} />
				{resume.experience.map((item) => (
					<div className='mb-3 border border-[#d5d8d0] bg-white/20 p-4' key={item.id}>
						<div className='grid gap-4 sm:grid-cols-2'>
							<Field label={t.company}>
								<input
									className={inputClass}
									placeholder={t.companyPlaceholder}
									value={item.company}
									onChange={(event) => onExperienceChange(item.id, "company", event.target.value)}
								/>
							</Field>
							<Field label={t.jobTitle}>
								<input
									className={inputClass}
									placeholder={t.jobTitlePlaceholder}
									value={item.role}
									onChange={(event) => onExperienceChange(item.id, "role", event.target.value)}
								/>
							</Field>
							<Field label={t.period}>
								<input
									className={inputClass}
									placeholder={t.periodPlaceholder}
									value={item.period}
									onChange={(event) => onExperienceChange(item.id, "period", event.target.value)}
								/>
							</Field>
							<Field className='sm:col-span-2' label={t.achievements}>
								<textarea
									className={inputClass}
									rows={2}
									placeholder={t.achievementsPlaceholder}
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
						<textarea className={inputClass} rows={2} placeholder={t.degreePlaceholder} {...bind("education")} />
					</Field>
				</div>
			</section>
			<section className={section}>
				<SectionHeading number='06' title={t.certificates} hint={t.certificatesHint} />
				<div className='grid gap-4'>
					<Field label={t.certificates}>
						<textarea
							className={inputClass}
							rows={2}
							placeholder={t.certificatesPlaceholder}
							{...bind("certificates")}
						/>
					</Field>
				</div>
			</section>
		</div>
	);
}

function SectionHeading({ number, title, hint }: { number: string; title: string; hint: string }) {
	return (
		<div className='section-heading-block mb-6 flex items-start gap-4'>
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
