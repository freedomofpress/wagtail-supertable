const { defineConfig } = require("eslint/config");
const fpfEslintConfig = require("fpf-wagtail-common/config/eslint.js");

module.exports = defineConfig([
	...fpfEslintConfig({
		files: ["wagtailsupertable/client/**/*.js"],
		// Webpack output
		ignores: ["wagtailsupertable/static/"],
	}),
]);
