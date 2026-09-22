import { SkillIcon } from "@/entities/resume";
import { Tooltip } from "@/shared/ui";
import type { Language, Translation } from "@/shared/i18n";
import { quotes } from "@/shared/config";
import type { Resume } from "@/entities/resume";
import { Minus, Plus } from "@phosphor-icons/react";
import { useMemo, useState, type Ref } from "react";

interface ResumePreviewProps {
	resume: Resume;
	t: Translation;
	language: Language;
	/* a handle on the sheet itself, for the page to scroll to when it is switched on
	   below the form on a narrow screen. Nothing else about the preview is exposed. */
	ref?: Ref<HTMLElement>;
}

export function ResumePreview({ resume, t, language, ref }: ResumePreviewProps) {
	const [zoom, setZoom] = useState(92);
	const pages = useMemo(
		() => Math.max(1, Math.ceil((resume.experience.length * 120 + resume.summary.length / 4 + 360) / 650)),
		[resume.experience.length, resume.summary.length],
	);
	const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);
	return (
		<aside
			ref={ref}
			className='print-preview min-w-0 border-t border-[#d7d8d0] bg-[#e7e6df] px-5 py-8 sm:px-8 lg:border-l lg:border-t-0 lg:px-[3vw] lg:py-11'
			aria-label={t.preview}
		>
			<div className='print-toolbar preview-toolbar'>
				<div>
					<span className='preview-kicker'>{t.preview}</span>
					<strong className='preview-page'>{t.pageOf.replace("{page}", "1").replace("{pages}", String(pages))}</strong>
				</div>
				<div className='zoom-stepper'>
					<Tooltip label={t.zoomOut}>
						<button
							type='button'
							aria-label={t.zoomOut}
							disabled={zoom <= 80}
							onClick={() => setZoom((value) => Math.max(80, value - 6))}
						>
							<Minus size={14} />
						</button>
					</Tooltip>
					<span>{zoom}%</span>
					<Tooltip label={t.zoomIn}>
						<button
							type='button'
							aria-label={t.zoomIn}
							disabled={zoom >= 100}
							onClick={() => setZoom((value) => Math.min(100, value + 4))}
						>
							<Plus size={14} />
						</button>
					</Tooltip>
				</div>
			</div>
			<div className='paper-stage'>
				<article className='print-paper' style={{ transform: `scale(${zoom / 100})` }}>
					<div className='flex justify-between gap-5'>
						<div className='min-w-0 flex-1'>
							<p className='mb-3 font-mono text-[11px] uppercase tracking-[.08em] text-[var(--accent-text)]'>
								{resume.role || t.previewRole}
							</p>
							<h2 className='font-display text-[27px] font-semibold leading-none tracking-[-.05em] text-[#153b34] sm:text-[32px]'>
								{resume.name || t.previewName}
							</h2>
							<div className='mt-4 flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-[9px] text-[#738078]'>
								{resume.email ? <span>✉ {resume.email}</span> : null}
								{resume.phone ? <span>⌕ {resume.phone}</span> : null}
								{resume.location ? <span>⌖ {resume.location}</span> : null}
								{resume.website ? <span>↗ {resume.website}</span> : null}
								{resume.github ? <span>◉ {resume.github}</span> : null}
								{resume.linkedin ? <span>in {resume.linkedin}</span> : null}
							</div>
						</div>
						<div className='resume-avatar grid h-[82px] w-[82px] shrink-0 place-items-center overflow-hidden rounded-full bg-[#d36f48] font-display text-[31px] font-semibold text-[#fbfaf5]'>
							{resume.photo ? (
								<img
									className='h-full w-full object-cover'
									src={resume.photo}
									alt=''
									width='82'
									height='82'
									loading='lazy'
								/>
							) : (
								<span>{resume.name.slice(0, 1) || "?"}</span>
							)}
						</div>
					</div>
					<div className='mt-7 border-y border-[#deded5] py-5'>
						<p className='whitespace-pre-line text-[11px] leading-[1.55] text-[#66736b]'>
							{resume.summary || t.previewSummary}
						</p>
					</div>
					<div className='resume-content pt-7'>
						<div className='resume-summary'>
							<section className='resume-summary-block resume-summary-skills rounded-sm border border-[#deded5] border-t-2 border-t-[#d36f48] bg-[#f8f7f1] p-4'>
								<h3 className='pt-1 font-display text-sm font-semibold text-[#153b34]'>{t.skills}</h3>
								<div className='skills-chip-row mt-3 flex flex-wrap content-start gap-1.5'>
									{resume.skills.map((skill) => (
										<span
											className='resume-skill-chip flex items-center gap-1 rounded-sm bg-[#e8eee7] px-2 py-1.5 text-[11px] text-[#3d6254]'
											key={skill}
										>
											<SkillIcon skill={skill} className='h-4 w-4' />
											{skill}
										</span>
									))}
								</div>
								{resume.languages.length ? (
									<div className='col-span-full mt-3 border-t border-[#e2e2da] pt-3'>
										<h4 className='mb-1.5 font-mono text-[9px] uppercase tracking-[.08em] text-[var(--paper-muted)]'>
											{t.languages}
										</h4>
										<div className='flex flex-wrap gap-1.5'>
											{resume.languages.map((entry) => (
												<span
													className='resume-lang-chip rounded-sm bg-[var(--paper-lang-chip)] px-2 py-1.5 text-[11px] text-[var(--paper-lang-chip-ink)]'
													key={entry.id}
												>
													{entry.language} {entry.level}
												</span>
											))}
										</div>
									</div>
								) : null}
							</section>
						</div>
						<div className='resume-experience-grid mt-8'>
							<h3 className='resume-section-heading mb-4 border-b-2 border-[#d36f48] pb-2 text-center font-display text-sm font-semibold text-[#153b34]'>
								{t.work}
							</h3>
							{resume.experience.map((item) => (
								<div className='resume-experience-entry mb-3 border-b border-[#e2e2da] pb-3' key={item.id}>
									<div className='flex justify-between gap-2'>
										<strong className='text-xs text-[#2c4139]'>{item.role || t.jobTitle}</strong>
										<strong className='text-[11px] font-semibold text-[var(--accent-text)]'>
											{item.company || t.company}
										</strong>
									</div>
									<time className='mt-1 block font-mono text-[11px] text-[var(--accent-text)]'>
										{item.period || t.period}
									</time>
									<p className='mt-2 whitespace-pre-line text-[10px] leading-[1.45] text-[#758079]'>
										{item.description}
									</p>
								</div>
							))}
						</div>
						<div className='resume-summary resume-bottom-summary mt-8'>
							<section className='resume-summary-block rounded-sm border border-[#deded5] border-t-2 border-t-[#d36f48] bg-[#f8f7f1] p-4'>
								<h3 className='mb-3 font-display text-sm font-semibold text-[#153b34]'>{t.degree}</h3>
								<p className='whitespace-pre-line text-[11px] leading-[1.55] text-[#758079]'>
									{resume.education || t.previewEducation}
								</p>
							</section>
							<section className='resume-summary-block rounded-sm border border-[#deded5] border-t-2 border-t-[#d36f48] bg-[#f8f7f1] p-4'>
								<h3 className='mb-3 font-display text-sm font-semibold text-[#153b34]'>{t.certificates}</h3>
								<p className='whitespace-pre-line text-[11px] leading-[1.55] text-[#758079]'>
									{resume.certificates || t.previewCertificates}
								</p>
							</section>
						</div>
					</div>
					<div className='mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-[#deded5] pt-5'>
						<p className='m-0 max-w-[78%] text-[10px] italic leading-[1.5] text-[var(--paper-muted)]'>
							“{language === "uk" ? quote.uk : quote.en}”
						</p>
						<span className='shrink-0 font-mono text-[8px] uppercase tracking-[.08em] text-[var(--paper-muted)]'>
							— {quote.author}
						</span>
					</div>
				</article>
			</div>
			<p className='print-note mt-4 text-center text-[11px] text-[#748079]'>
				<span className='mr-1 text-[var(--accent-text)]'>✦</span>
				{t.previewNote}
			</p>
		</aside>
	);
}
