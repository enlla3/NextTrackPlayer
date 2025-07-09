module.exports = {
	presets: [
		// target current Node for Jest
		["@babel/preset-env", { targets: { node: "current" } }],
		// React with automatic runtime so you don't need `import React`
		["@babel/preset-react", { runtime: "automatic" }],
	],
};
