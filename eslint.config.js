export default defineConfig([
	globalIgnores(["dist"]),

	{
		files: [
			"babel.config.cjs",
			"jest.config.cjs",
			"vite.config.js",
			"src/setupTests.js",
			"__mocks__/**/*.js",
		],
		languageOptions: {
			env: { node: true },
		},
	},

	{
		files: [
			"**/__tests__/**/*.[jt]s?(x)",
			"**/?(*.)+(spec|test).[jt]s?(x)",
		],
		languageOptions: {
			env: { jest: true },
		},
	},

	{
		files: ["**/*.{js,jsx}"],
		extends: [
			js.configs.recommended,
			reactHooks.configs["recommended-latest"],
			reactRefresh.configs.vite,
		],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
			parserOptions: {
				ecmaVersion: "latest",
				ecmaFeatures: { jsx: true },
				sourceType: "module",
			},
		},
		rules: {
			"no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
		},
	},
]);
