import type { Language } from "@/services/copy";

interface LanguageSwitcherProps {
	language: Language;
	onChange: (language: Language) => void;
}

export function LanguageSwitcher({ language, onChange }: LanguageSwitcherProps) {
	return (
		<div className='flex gap-0.5 rounded border border-[#d7d8d0] p-0.5' aria-label='Language'>
			{(["en", "uk"] as const).map((option) => (
				<button
					className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${language === option ? "bg-[#153b34] text-[#f6f5ef]" : "text-[#78817c]"}`}
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
