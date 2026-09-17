import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	base: "/cv-app-cloude/",
	build: { cssTarget: ["chrome111", "edge111", "firefox111", "safari17"] },
	resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
});
