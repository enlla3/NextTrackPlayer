export default defineConfig([
	globalIgnores(["dist"]),

	// 1) Treat config, setup & mocks as Node scripts:
	{
		files: [
			"babel.config.cjs",
			"jest.config.cjs",
			"vite.config.js",
			"src/setupTests.js",
			"__mocks__/**/*.js", // << add this line
		],
		languageOptions: {
			env: { node: true }, // enables module, require, etc.
		},
	},

	// 2) Jest test files...
	{
		files: [
			"**/__tests__/**/*.[jt]s?(x)",
			"**/?(*.)+(spec|test).[jt]s?(x)",
		],
		languageOptions: {
			env: { jest: true },
		},
	},

	// 3) Your normal JS/React rules...
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
