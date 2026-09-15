export type Language = "en" | "uk";

export interface Translation {
	autoSave: string;
	clear: string;
	download: string;
	create: string;
	notice: string;
	completion: string;
	profile: string;
	profileHint: string;
	contacts: string;
	contactsHint: string;
	skills: string;
	skillsHint: string;
	experience: string;
	experienceHint: string;
	education: string;
	educationHint: string;
	photo: string;
	photoAdded: string;
	photoHint: string;
	name: string;
	position: string;
	about: string;
	email: string;
	phone: string;
	city: string;
	website: string;
	addSkill: string;
	company: string;
	jobTitle: string;
	period: string;
	achievements: string;
	remove: string;
	addWork: string;
	degree: string;
	certificates: string;
	preview: string;
	page: string;
	jobPlaceholder: string;
	namePlaceholder: string;
	previewRole: string;
	previewName: string;
	previewSummary: string;
	work: string;
	previewEducation: string;
	previewCertificates: string;
	previewNote: string;
	confirmClear: string;
	reset: string;
}

export const translations: Record<Language, Translation> = {
	en: {
		autoSave: "Draft is saved automatically",
		clear: "Clear",
		download: "Download PDF",
		create: "Create your resume",
		notice: "Everything stays in this browser.",
		completion: "complete",
		profile: "Profile",
		profileHint: "Your first impression",
		contacts: "Contact details",
		contactsHint: "How to reach you",
		skills: "Skills",
		skillsHint: "Technologies and strengths",
		experience: "Work experience",
		experienceHint: "Show your professional path",
		education: "Education and courses",
		educationHint: "Add relevant learning",
		photo: "Add photo",
		photoAdded: "Photo added",
		photoHint: "JPG or PNG · up to 2 MB",
		name: "Full name",
		position: "Desired position",
		about: "About you",
		email: "Email",
		phone: "Phone",
		city: "City",
		website: "Website or LinkedIn",
		addSkill: "Add a skill",
		company: "Company",
		jobTitle: "Job title",
		period: "Period",
		achievements: "Achievements",
		remove: "Remove",
		addWork: "＋ Add workplace",
		degree: "Education",
		certificates: "Courses and certificates",
		preview: "Live preview",
		page: "A4 · Page 1 of 1",
		jobPlaceholder: "For example, Product Designer",
		namePlaceholder: "For example, Anna Smith",
		previewRole: "Desired position",
		previewName: "Your name",
		previewSummary: "Tell people about their professional path.",
		work: "Work experience",
		previewEducation: "Add your education",
		previewCertificates: "Add your certificates",
		previewNote: "This is how your PDF will look. Your data never leaves this device.",
		confirmClear: "Delete the saved draft?",
		reset: "Draft reset",
	},
	uk: {
		autoSave: "Чернетка зберігається автоматично",
		clear: "Очистити",
		download: "Завантажити PDF",
		create: "Створіть своє резюме",
		notice: "Усі дані залишаються у цьому браузері.",
		completion: "заповнено",
		profile: "Профіль",
		profileHint: "Ваше перше враження",
		contacts: "Контакти",
		contactsHint: "Як з вами зв'язатися",
		skills: "Навички",
		skillsHint: "Технології та сильні сторони",
		experience: "Досвід роботи",
		experienceHint: "Покажіть свій професійний шлях",
		education: "Освіта та курси",
		educationHint: "Додайте релевантне навчання",
		photo: "Додати фото",
		photoAdded: "Фото додано",
		photoHint: "JPG або PNG · до 2 МБ",
		name: "Ім'я та прізвище",
		position: "Бажана посада",
		about: "Коротко про себе",
		email: "Email",
		phone: "Телефон",
		city: "Місто",
		website: "Сайт або LinkedIn",
		addSkill: "Додати навичку",
		company: "Компанія",
		jobTitle: "Посада",
		period: "Період",
		achievements: "Досягнення",
		remove: "Видалити",
		addWork: "＋ Додати місце роботи",
		degree: "Освіта",
		certificates: "Курси та сертифікати",
		preview: "Живий попередній перегляд",
		page: "A4 · Сторінка 1 з 1",
		jobPlaceholder: "Наприклад, Product Designer",
		namePlaceholder: "Наприклад, Анна Петренко",
		previewRole: "Бажана посада",
		previewName: "Ваше ім'я",
		previewSummary: "Розкажіть про свій професійний шлях.",
		work: "Досвід роботи",
		previewEducation: "Додайте освіту",
		previewCertificates: "Додайте сертифікати",
		previewNote: "Так виглядатиме ваш PDF. Дані не залишають цей пристрій.",
		confirmClear: "Видалити збережену чернетку?",
		reset: "Чернетку скинуто",
	},
};
