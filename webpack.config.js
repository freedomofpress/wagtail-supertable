var webpack       = require('webpack');
var { merge }     = require('webpack-merge');

var TARGET = process.env.npm_lifecycle_event;

var target = __dirname + '/wagtailsupertable/static/js/';

var common = {
	entry: {
		table_block: __dirname + '/wagtailsupertable/client/table-block.js',
	},

	output: {
		path: target,
		filename: '[name].js'
	},

	resolve: {
		extensions: ['.js'],
		modules: ['node_modules']
	}
};

if (TARGET === 'build') {
	module.exports = merge(common, {
		plugins: [
			new webpack.DefinePlugin({
				'process.env': { 'NODE_ENV': JSON.stringify('production') }
			})
		],
    optimization: {
      minimize: false,
    }
	});
}

if (TARGET === 'start') {
	module.exports = merge(common, {
		devtool: 'eval-source-map',
		devServer: {
			contentBase: target,
			progress: true,
		}
	});
}
