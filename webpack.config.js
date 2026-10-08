const path = require("path");

module.exports = {
	context: __dirname,

	entry: {
		table_block: "./wagtailsupertable/client/table-block.js",
	},

	output: {
		path: path.resolve(__dirname, "wagtailsupertable/static/js"),
		// No content hash: blocks.py references this file by name.
		filename: "[name].js",
	},

	optimization: {
		// Keep the committed bundle readable.
		minimize: false,
	},
};
