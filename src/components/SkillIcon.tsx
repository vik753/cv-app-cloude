import { getSkillIconUrl } from "@/services/skillIcons";

interface SkillIconProps {
	skill: string;
	className?: string;
}

export function SkillIcon({ skill, className = "h-5 w-5" }: SkillIconProps) {
	const iconUrl = getSkillIconUrl(skill);

	return iconUrl ? <img className={className} src={iconUrl} alt='' width='20' height='20' loading='lazy' /> : null;
}