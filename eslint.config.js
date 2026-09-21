import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
	globalIgnores(["dist"]),
	{
		files: ["**/*.{ts,tsx}"],
		extends: [
			js.configs.recommended,
			tseslint.configs.recommended,
			reactHooks.configs.flat.recommended,
			reactRefresh.configs.vite,
		],
		languageOptions: {
			globals: globals.browser,
		},
		rules: {
			"@typescript-eslint/no-explicit-any": "error",
			/* @ts-ignore is banned outright; @ts-expect-error needs a same-line justification */
			"@typescript-eslint/ban-ts-comment": [
				"error",
				{ "ts-ignore": true, "ts-nocheck": true, "ts-expect-error": "allow-with-description" },
			],
		},
	},
	/* must stay last: turns off formatting-related rules so they never fight Prettier */
	eslintConfigPrettier,
]);
