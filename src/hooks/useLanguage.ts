import { translations, type Language } from "@/services/copy";
import { useEffect, useState } from "react";

const languageStorageKey = "resume-canvas-language";

const readLanguage = (): Language => (localStorage.getItem(languageStorageKey) === "uk" ? "uk" : "en");

export function useLanguage() {
	const [language, setLanguage] = useState<Language>(readLanguage);
	useEffect(() => {
		localStorage.setItem(languageStorageKey, language);
	}, [language]);
	return { language, setLanguage, t: translations[language] };
}
