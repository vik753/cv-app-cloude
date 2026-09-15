import { LanguageSwitcher, ResumeForm, ResumePreview, translations, useLanguage, useResumeStore } from "@/index";
import { useState } from "react";

export function App() {
	const resume = useResumeStore((state) => state.resume);
	const updateField = useResumeStore((state) => state.updateField);
	const updateExperience = useResumeStore((state) => state.updateExperience);
	const updateResume = useResumeStore((state) => state.updateResume);
	const resetResume = useResumeStore((state) => state.reset);
	const { language, setLanguage, t } = useLanguage();
	const [notice, setNotice] = useState(t.autoSave);

	const clearDraft = () => {
		if (window.confirm(t.confirmClear)) {
			resetResume();
			setNotice(t.reset);
		}
	};

	return (
		<main className='min-h-screen bg-[#f2f1eb]'>
			<header className='print-header flex min-h-[60px] flex-col items-start justify-between gap-4 border-b border-[#d7d8d0] bg-[#f2f1eb]/90 px-5 py-4 sm:flex-row sm:items-center sm:px-[3.4vw] sm:py-0'>
				<div className='flex items-center gap-2.5 font-display text-[15px] font-semibold'>
					<span className='grid h-7 w-7 place-items-center rounded-full bg-[#153b34] font-mono text-[13px] text-[#f5f4ee]'>
						cv
					</span>
					<span>Resume Canvas</span>
				</div>
				<div className='flex w-full items-center justify-between gap-3 sm:w-auto sm:gap-4'>
					<LanguageSwitcher
						language={language}
						onChange={(nextLanguage) => {
							setLanguage(nextLanguage);
							setNotice(translations[nextLanguage].autoSave);
						}}
					/>
					<span className='hidden items-center gap-2 font-mono text-[11px] text-[#68716c] md:flex'>
						<span className='h-1.5 w-1.5 rounded-full bg-[#83b96d]' />
						{notice}
					</span>
					<button className='text-[13px] text-[#59625e]' type='button' onClick={clearDraft}>
						{t.clear}
					</button>
					<button
						className='rounded bg-[#153b34] px-3 py-2 text-[13px] text-[#f6f5ef]'
						type='button'
						onClick={() => window.print()}
					>
						{t.download} <span className='ml-2 text-base'>↗</span>
					</button>
				</div>
			</header>
			<div className='print-workspace grid w-full min-w-0 lg:grid-cols-2'>
				<section className='print-editor min-w-0 px-5 py-8 sm:px-8 lg:px-[4vw] lg:py-11' aria-label={t.create}>
					<div className='mb-6 flex justify-between font-mono text-[11px] uppercase tracking-[.08em] text-[#768079]'>
						{t.create}
						<span>01 / 01</span>
					</div>
					<div className='flex items-end justify-between gap-6 border-b border-[#d7d8d0] pb-11'>
						<div>
							<h1 className='font-display text-[clamp(35px,4vw,57px)] font-semibold leading-[.99] tracking-[-.055em] text-[#153b34]'>
								{language === "en" ? "Build a resume," : "Зберіть резюме,"}
								<br />
								<em className='text-[#d36f48] not-italic'>
									{language === "en" ? "that gets noticed." : "яке помітять."}
								</em>
							</h1>
							<p className='mt-5 max-w-[430px] text-sm leading-[1.55] text-[#69736d]'>{t.notice}</p>
						</div>
						<div className='min-w-[100px] text-right font-mono text-[11px] text-[#78817c]'>
							<strong className='block font-display text-2xl text-[#153b34]'>72%</strong>
							<span>{t.completion}</span>
							<div className='mt-3 h-[3px] w-[100px] bg-[#d5d5cd]'>
								<i className='block h-full w-[72%] bg-[#d36f48]' />
							</div>
						</div>
					</div>
					<ResumeForm
						resume={resume}
						t={t}
						onChange={updateField}
						onExperienceChange={updateExperience}
						onResumeChange={updateResume}
					/>
				</section>
				<ResumePreview resume={resume} t={t} />
			</div>
		</main>
	);
}
