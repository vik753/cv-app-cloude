/* Browsers name a saved PDF after the document's title, so the title is what decides
   whether the file lands as "not boring CV.pdf" or as something a recruiter can find in
   a folder of fifty. The name keeps its own letters, Cyrillic included; only characters
   a file system refuses, and runs of whitespace, are replaced. */
const UNSAFE = /[\\/:*?"<>|]+/g;

export const printFileName = (name: string): string => {
	const words = name.replace(UNSAFE, " ").trim().split(/\s+/).filter(Boolean);
	return [...words, "CV"].join("_");
};
