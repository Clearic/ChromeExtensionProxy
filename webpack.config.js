const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

console.log("process.env.NODE_ENV: " + process.env.NODE_ENV);

module.exports = {
    entry: "./src/script.js",
    output: {
    	path: path.resolve(__dirname, "build"),
    	filename: "bundle.js"
    },
    module: {
        rules: [
            { test: /\.css$/, use: [ "style-loader", "css-loader" ] }
        ]
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: "index.html", to: "index.html" },
            { from: "icons", to: "icons" },
            { from: "manifest.json", to: "manifest.json" }
        ])
    ]
};
