var webpack       = require('webpack');
var merge         = require('webpack-merge');
var autoprefixer  = require('autoprefixer');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');
var path = require('path');

var TARGET = process.env.npm_lifecycle_event;
process.env.BABEL_ENV = TARGET;

var target = __dirname + '/wagtailsupertable/static/js/';

var STATIC_URL = process.env.STATIC_URL || '/static/';
var sassData = '$static-url: "' + STATIC_URL + '";';
console.log('Using STATIC_URL', STATIC_URL);


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
	},

	module: {
		rules: [
			{
				test: /\.js$/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: ['@babel/preset-react', '@babel/preset-env'],
							plugins: ['add-module-exports']
						},
					}
				],
				include: [
					path.join(__dirname, '/client/'),
				],
			},
			{
				test: /\.s[ca]ss$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					'postcss-loader',
					{
						loader: 'sass-loader',
						options: {
							includePaths: [path.resolve(__dirname, 'node_modules/')],
							data: sassData
						}
					}
				],
			},
			{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
			}
		]
	},

	plugins: [
		new MiniCssExtractPlugin({
			filename: (getPath) => {
				return getPath('[name].css');
			}
		}),
	]
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