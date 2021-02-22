var PACKAGE = require("./package.json");
var version = PACKAGE.version;
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack');

module.exports = {
  entry: "./src/index.ts",
  output: {
    path: __dirname + "/dist/js",
    filename: "all.min." + version + ".js",
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
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
};
