var PACKAGE = require("./package.json");
var version = PACKAGE.version;
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack');

module.exports = {
  entry: "./src/index.ts",
  output: {
    path: __dirname + "/dist/js",
    filename: "bundle.min." + version + ".js",
  },
  devServer: {
    contentBase: "./dist",
  },
  plugins: [
    new HtmlWebpackPlugin({
    	filename: '../index.html',
    	scriptLoading: 'defer',
    	template: 'src/html/indextemplate.html'
  	}),
    new webpack.DefinePlugin({
      'OPD_ENV': JSON.stringify('prod')
    })
  ],
	externals: {
		"pixi.js": "PIXI",
  	"opdPreloader": "opdPreloader",
    "gsap": "gsap",
		"WebFont": "WebFont"
	//	{"Howler": "Howler"}
	},
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
};
