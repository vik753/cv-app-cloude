import type { Language } from "@/shared/i18n";

/* The two-letter faces of the languages, shared by the segmented switch and the menu
   rows it folds into on a narrow screen. They are the control's own presentation rather
   than copy — "EN" is not translated into Ukrainian — which is why they live in the
   feature and not in the dictionaries. */
export const languageLabels: Record<Language, string> = {
	en: "EN",
	uk: "УКР",
};
