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
			coverage: {
				provider: "v8",
				reporter: ["text", "html"],
			},
		},
	}),
);
