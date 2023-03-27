import { defineConfig, configDefaults } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		coverage: {
			include: ["packages/*/**/*.test.{ts,tsx,js,jsx}"],
			exclude: [...configDefaults.exclude],
		},
	},
});
