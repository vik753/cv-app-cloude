import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

/* Feature-Sliced Design layer order, top to bottom. Imports may only go downward:
   a layer may use anything below it, never above, and `shared` imports from nothing
   but itself. See .claude/team/ARCHITECTURE.md for the full rationale. */
const FSD_LAYER_ORDER = ["app", "pages", "widgets", "features", "entities", "shared"];

/* Every slice that exists today (for `shared`, its segments — `shared` has no slices
   of its own). One `files` block is generated per entry below, so a new slice needs
   a line here before the linter knows to guard it. */
const FSD_SLICES = {
	app: [null],
	pages: ["builder"],
	widgets: ["scene", "app-footer"],
	features: ["resume-form", "resume-preview", "palette-switch", "language-switch"],
	entities: ["resume"],
	shared: ["ui", "lib", "i18n", "config"],
};

/* Builds the `no-restricted-imports` config that locks a slice to the three rules in
   ARCHITECTURE.md: imports go downward only, no sibling reaches across the same layer,
   and anything below is entered through its barrel — `@/<layer>/<slice>` — never a path
   into it. A slice's own files are outside all three groups: they address each other
   directly by full `@/` path, which is the established convention (`shared/i18n/
   useLanguage.ts` importing `shared/i18n/copy.ts` is the example ARCHITECTURE.md names). */
function restrictedImportsFor(layer, slice) {
	const layerIndex = FSD_LAYER_ORDER.indexOf(layer);
	const layersAbove = FSD_LAYER_ORDER.slice(0, layerIndex);
	const layersBelow = FSD_LAYER_ORDER.slice(layerIndex + 1);
	const ownPath = slice ? `@/${layer}/${slice}` : `@/${layer}`;
	const patterns = [];

	for (const above of layersAbove) {
		patterns.push({
			group: [`@/${above}/**`],
			message: `Imports go downward only: ${layer} may not import from ${above}.`,
		});
	}

	if (FSD_SLICES[layer].length > 1) {
		/* Gitignore-style negation (which is what the `group` matcher uses) cannot
		   re-include a path under a directory unless that directory is un-ignored too —
		   `!${ownPath}/**` alone leaves the slice itself still matched by `@/${layer}/**`.
		   Both the slice's own path and its contents need carving out. */
		patterns.push({
			group: [`@/${layer}/**`, `!${ownPath}`, `!${ownPath}/**`],
			message: `${layer} slices may not import each other. If both need this, move it down a layer.`,
		});
	}

	for (const below of layersBelow) {
		patterns.push({
			group: [`@/${below}/*/**`],
			message: `Enter ${below} through its barrel — @/${below}/<slice> — not an internal path.`,
		});
	}

	return patterns;
}

const layerBoundaryRules = FSD_LAYER_ORDER.flatMap((layer) =>
	FSD_SLICES[layer].map((slice) => ({
		files: [slice ? `src/${layer}/${slice}/**/*.{ts,tsx}` : `src/${layer}/**/*.{ts,tsx}`],
		rules: {
			"no-restricted-imports": ["error", { patterns: restrictedImportsFor(layer, slice) }],
		},
	})),
);

export default defineConfig([
	globalIgnores(["dist"]),
	{
		/* plain config/tooling scripts (eslint.config.js today) — run in Node, not the page, and are not part of a TS project */
		files: ["**/*.{js,mjs}"],
		extends: [js.configs.recommended],
		languageOptions: {
			globals: globals.node,
		},
	},
	{
		files: ["**/*.{ts,tsx}"],
		extends: [
			js.configs.recommended,
			...tseslint.configs.recommendedTypeChecked,
			reactHooks.configs.flat.recommended,
			reactRefresh.configs.vite,
		],
		languageOptions: {
			globals: globals.browser,
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
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
	/* One block per slice, enforcing the FSD layer rules from ARCHITECTURE.md: downward
	   imports only, no horizontal imports between slices of one layer, and entry through
	   a slice's barrel from anywhere outside it. Spread after the base TS block so these
	   `no-restricted-imports` entries merge with, rather than replace, the rules above. */
	...layerBoundaryRules,
	/* must stay last: turns off formatting-related rules so they never fight Prettier */
	eslintConfigPrettier,
]);
