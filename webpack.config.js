const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

console.log("process.env.NODE_ENV: " + process.env.NODE_ENV);

module.exports = {
    entry: "./src/script.js",
    output: {
        path: path.resolve(__dirname, "build"),
        filename: "bundle.js"
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader"
                ]
            }
        ]
    },
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                sourceMap: true
            }),
            new OptimizeCSSAssetsPlugin({})
        ]
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: "index.html", to: "index.html" },
            { from: "icons", to: "icons" },
            { from: "manifest.json", to: "manifest.json" }
        ]),
        new MiniCssExtractPlugin({
            filename: "styles.css"
        })
    ]
};
