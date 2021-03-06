const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const env = process.env.NODE_ENV
const isDev = (env === 'development')
const envPlugins = isDev
	? []
	: [
		new MiniCssExtractPlugin({
			filename: 'css/common.[contenthash].css',
			chunkFilename: 'css/[name].[contenthash:8].css',
		}),
	]

module.exports = {
	mode: env,
	entry: './src/index.js',
	output: {
		filename: 'js/[name].[contenthash].js',
		chunkFilename: 'js/[contenthash:8].chunk.js',
		path: path.resolve(__dirname, 'dist'),
		clean: true,
	},
	devtool: isDev ? 'eval-cheap-module-source-map' : false,
	devServer: {
		port: 8088,
		host: '127.0.0.2',
		disableHostCheck: true,
		hot: true,
		inline: true,
		noInfo: true,
		// noInfo: false,
		clientLogLevel: 'warning',
		after() {
			console.log('   address：', '\x1B[34m\033[1m', `http://${this.host}:${this.port}`)
		}
	},
	cache: {
		type: 'filesystem',
		buildDependencies: {
			config: [__filename],
		}
	},
	resolve: {
		extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
		alias: {
			'@Src': path.resolve(__dirname, './src'),
			'@Public': path.resolve(__dirname, './public'),
			'@Assets': path.resolve(__dirname, './src/assets'),
			'@Components': path.resolve(__dirname, './src/components'),
			'@Utils': path.resolve(__dirname, './src/utils'),
			'@Service': path.resolve(__dirname, './src/service'),
		},
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,						// js: /\.m?js$/  js/jsx: /\.(js|jsx)$/  js/ts/jsx: /\.(j|t)s[x]?$/  
				use: {
					loader: 'babel-loader',
					options: {
						cacheDirectory: true,				// 缓存执行结果到默认目录 提高编译速度
					}
				},
				include: [
					path.join(__dirname, 'src'),
					path.join(__dirname, 'mock'),
				],
			},
			{
				test: /\.(le|c)ss$/,
				use: [
					{
						loader: 'style-loader',
					},
					{
						loader: 'css-loader',
					},
					{
						loader: 'less-loader',
						options: {
							lessOptions: {
								javascriptEnabled: true,
							}
						},
					},
					// isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
					// 'css-loader',						 	// 这里需不需加 importLoaders: 1 ？？？
					// 'postcss-loader',
					// 'less-loader',
					// options: {
					// 	javascriptEnabled: true
					// }
				]
			},
			{
				// test: /\.(jpg|jpeg|png|gif|ico|cur|svg|)$/,
				test: /\.(jpg|jpeg|png|gif|ico|cur|)$/,
				type: 'asset',
				generator: {
					filename: 'assets/images/[name]_[hash:6][ext]'
				},
				parser: {
					dataUrlCondition: {
						maxSize: 10 * 1024
					}
				}
			},
			{
				test: /\.(eot|ttf|ttc|woff|woff2|)$/,
				type: 'asset/resource',
				generator: {
					filename: 'assets/fonts/[name]_[hash:6][ext]'
				},

			},
			{
				test: /\.svg/,
				use: ['@svgr/webpack'],
			},
		],
	},
	optimization: {
		splitChunks: {
			chunks: 'all',
			minChunks: 1,
			cacheGroups: {
				defaultVendors: {
					name: 'vendors',
					test: /[\\/]node_modules[\\/]/,
					priority: -10,
				},
				commons: {
					name: 'commons',
					minChunks: 2,
					priority: -20,
				}
			}
		},
		minimizer: [
			new TerserPlugin({
				extractComments: false,
				terserOptions: {
					compress: { pure_funcs: ['console.log'] }
				}
			}),
			new CssMinimizerPlugin()
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, './src/index.html'),
			inject: 'body',
			hash: true,
		}),
		...envPlugins
	]
}