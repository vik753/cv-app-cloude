import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

/* extends vite.config.ts instead of duplicating the "@/" alias and plugins */
export default mergeConfig(
	viteConfig,
	defineConfig({
		test: {
			environment: "jsdom",
			globals: true,
			setupFiles: ["./src/setupTests.ts"],
			/* Node now ships its own global `localStorage` (stable as of Node 22+, without
			   a `--localstorage-file` it is a non-functional stub). Vitest's jsdom
			   environment only patches globals that are *not already present* on the Node
			   global object, so on these Node versions `window.localStorage` silently
			   resolves to Node's broken stub instead of jsdom's real Storage — every
			   `localStorage` read/write in a test then fails with no error at the call
			   site it eventually surfaces in. Disabling Node's own implementation lets
			   jsdom's populate step install its working one, same as on older Node. */
			execArgv: ["--no-experimental-webstorage"],
			/* Vitest hands every stylesheet to a test as an empty string, `?raw` included.
			   One file's raw text is let through, because a test holds a number in it to its
			   copy in TypeScript (useCompactViewport.test.ts). Only the `?raw` request: the
			   stylesheet itself stays skipped, so no test's computed styles see it. */
			css: { include: [/src\/app\/styles\/panels\.css\?raw/] },
			coverage: {
				provider: "v8",
				reporter: ["text", "html"],
			},
		},
	}),
);
