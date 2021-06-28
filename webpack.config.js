const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  module: {
    rules: [
      { test: /\.css$/i, use: ["style-loader", "css-loader"] },
      {
        test: /\.(png|jpe?g|gif|obj|mtl)$/i,
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
    ],
  },
  output: {
    filename: "threejs-car-driving.min.js",
    path: path.resolve(__dirname, "public"),
  },
  devServer: {
    publicPath: "/",
    contentBase: "./public",
    hot: true,
  },
};
