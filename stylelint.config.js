const { rules } = require("fpf-wagtail-common/config/stylelint.json");

// The shared config extends stylelint-config-standard-scss; this repo only
// has plain CSS, so use the CSS preset with the shared rules.
module.exports = {
	extends: ["stylelint-config-standard"],
	rules,
};
