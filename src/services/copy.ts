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
	github: string;
	linkedin: string;
	mode: string;
	palette: string;
	light: string;
	dark: string;
	fields: string;
	pageOf: string;
	zoomOut: string;
	zoomIn: string;
	previewHide: string;
	previewShow: string;
	previewLabel: string;
	sceneHide: string;
	sceneShow: string;
	sceneOn: string;
	sceneOff: string;
	addSkill: string;
	languages: string;
	languageLabel: string;
	languagePlaceholder: string;
	levelLabel: string;
	addLanguage: string;
	company: string;
	jobTitle: string;
	period: string;
	achievements: string;
	remove: string;
	addWork: string;
	degree: string;
	certificates: string;
	certificatesHint: string;
	preview: string;
	page: string;
	jobPlaceholder: string;
	namePlaceholder: string;
	summaryPlaceholder: string;
	emailPlaceholder: string;
	phonePlaceholder: string;
	locationPlaceholder: string;
	websitePlaceholder: string;
	githubPlaceholder: string;
	linkedinPlaceholder: string;
	degreePlaceholder: string;
	certificatesPlaceholder: string;
	companyPlaceholder: string;
	jobTitlePlaceholder: string;
	periodPlaceholder: string;
	achievementsPlaceholder: string;
	clearTooltip: string;
	paletteBlurple: string;
	paletteCream: string;
	paletteSlate: string;
	themeBlurpleName: string;
	themeCreamName: string;
	themeSlateName: string;
	switchToEnglish: string;
	switchToUkrainian: string;
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
		city: "City, Country",
		website: "Website",
		github: "GitHub",
		linkedin: "LinkedIn",
		mode: "Color mode",
		palette: "Palette",
		light: "Light",
		dark: "Dark",
		fields: "fields",
		pageOf: "A4 · page {page} of {pages}",
		zoomOut: "Zoom out",
		zoomIn: "Zoom in",
		previewHide: "Hide preview",
		previewShow: "Show preview",
		previewLabel: "Preview",
		sceneHide: "Turn off animated background",
		sceneShow: "Turn on animated background",
		sceneOn: "On",
		sceneOff: "Off",
		addSkill: "Add a skill",
		languages: "Languages",
		languageLabel: "Language",
		languagePlaceholder: "e.g. Ukrainian",
		levelLabel: "Level",
		addLanguage: "Add",
		company: "Company",
		jobTitle: "Job title",
		period: "Period",
		achievements: "Achievements",
		remove: "Remove",
		addWork: "Add workplace",
		degree: "Education",
		certificates: "Courses and certificates",
		certificatesHint: "Add courses and certificates",
		preview: "Live preview",
		page: "A4 · Page 1 of 1",
		jobPlaceholder: "For example, Product Designer",
		namePlaceholder: "For example, Anna Smith",
		summaryPlaceholder: "Briefly describe your experience, key skills, and what makes you a strong candidate.",
		emailPlaceholder: "you@example.com",
		phonePlaceholder: "+1 234 567 8900",
		locationPlaceholder: "For example, London, UK",
		websitePlaceholder: "yourname.dev",
		githubPlaceholder: "github.com/username",
		linkedinPlaceholder: "linkedin.com/in/username",
		degreePlaceholder: "University name · Degree · Graduation year",
		certificatesPlaceholder: "Course name · Institution · Year",
		companyPlaceholder: "For example, Northstar Studio",
		jobTitlePlaceholder: "For example, Frontend Developer",
		periodPlaceholder: "For example, 2022 — Present",
		achievementsPlaceholder: "Describe your responsibilities and key achievements.",
		clearTooltip: "Clear all form data — this permanently erases everything from the form and your browser's storage.",
		paletteBlurple: "Cool violet accent",
		paletteCream: "Warm neutral, the default",
		paletteSlate: "No background fills — print-safe",
		themeBlurpleName: "Blurple",
		themeCreamName: "Cream",
		themeSlateName: "Slate",
		switchToEnglish: "Switch to English",
		switchToUkrainian: "Switch to Ukrainian",
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
		city: "Місто, країна",
		website: "Сайт",
		github: "GitHub",
		linkedin: "LinkedIn",
		mode: "Колірний режим",
		palette: "Палітра",
		light: "Світла",
		dark: "Темна",
		fields: "полів",
		pageOf: "A4 · сторінка {page} з {pages}",
		zoomOut: "Зменшити",
		zoomIn: "Збільшити",
		previewHide: "Сховати попередній перегляд",
		previewShow: "Показати попередній перегляд",
		previewLabel: "Прев'ю",
		sceneHide: "Вимкнути анімований фон",
		sceneShow: "Увімкнути анімований фон",
		sceneOn: "Увімк",
		sceneOff: "Вимк",
		addSkill: "Додати навичку",
		languages: "Мови",
		languageLabel: "Мова",
		languagePlaceholder: "Напр. Українська",
		levelLabel: "Рівень",
		addLanguage: "Додати",
		company: "Компанія",
		jobTitle: "Посада",
		period: "Період",
		achievements: "Досягнення",
		remove: "Видалити",
		addWork: "Додати місце роботи",
		degree: "Освіта",
		certificates: "Курси та сертифікати",
		certificatesHint: "Додайте курси та сертифікати",
		preview: "Живий попередній перегляд",
		page: "A4 · Сторінка 1 з 1",
		jobPlaceholder: "Наприклад, Product Designer",
		namePlaceholder: "Наприклад, Анна Петренко",
		summaryPlaceholder: "Коротко опишіть свій досвід, ключові навички та чому ви сильний кандидат.",
		emailPlaceholder: "you@example.com",
		phonePlaceholder: "+380 12 345 6789",
		locationPlaceholder: "Наприклад, Київ, Україна",
		websitePlaceholder: "yourname.dev",
		githubPlaceholder: "github.com/username",
		linkedinPlaceholder: "linkedin.com/in/username",
		degreePlaceholder: "Назва університету · Спеціальність · Рік випуску",
		certificatesPlaceholder: "Назва курсу · Заклад · Рік",
		companyPlaceholder: "Наприклад, Northstar Studio",
		jobTitlePlaceholder: "Наприклад, Frontend Developer",
		periodPlaceholder: "Наприклад, 2022 — дотепер",
		achievementsPlaceholder: "Опишіть обов'язки та ключові досягнення.",
		clearTooltip: "Очистити всі дані форми — це остаточно видалить усе з форми та пам'яті браузера.",
		paletteBlurple: "Холодний фіолетовий акцент",
		paletteCream: "Теплий нейтральний, типовий",
		paletteSlate: "Без заливки фону — безпечно для друку",
		themeBlurpleName: "Blurple",
		themeCreamName: "Cream",
		themeSlateName: "Slate",
		switchToEnglish: "Переключити на англійську",
		switchToUkrainian: "Переключити на українську",
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
