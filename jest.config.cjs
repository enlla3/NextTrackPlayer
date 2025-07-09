// jest.config.cjs
module.exports = {
	testEnvironment: "jsdom",
	transform: {
		"^.+\\.[jt]sx?$": "babel-jest",
	},
	setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
	moduleNameMapper: {
		// ⬇️ No leading/trailing slashes here—just the pattern string
		"^.+\\.(css|png|svg)$": "<rootDir>/__mocks__/fileMock.js",
	},
	testMatch: [
		"**/__tests__/**/*.[jt]s?(x)",
		"**/?(*.)+(spec|test).[jt]s?(x)",
	],
};
