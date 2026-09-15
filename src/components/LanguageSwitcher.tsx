import type { Language } from "@/services/copy";

interface LanguageSwitcherProps {
	language: Language;
	onChange: (language: Language) => void;
}

export function LanguageSwitcher({ language, onChange }: LanguageSwitcherProps) {
	return (
		<div className='language-switcher flex gap-0.5 rounded border p-0.5' aria-label='Language'>
			{(["en", "uk"] as const).map((option) => (
				<button
					className={`rounded px-2 py-1 font-mono text-[10px] ${language === option ? "active" : ""}`}
					key={option}
					type='button'
					onClick={() => onChange(option)}
				>
					{option.toUpperCase()}
				</button>
			))}
		</div>
	);
}
