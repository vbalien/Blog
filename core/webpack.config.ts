import * as path from "path";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import webpack from "webpack";
import { CleanWebpackPlugin } from "clean-webpack-plugin";

const isDevelopment = process.env.NODE_ENV !== "production";

const config: webpack.Configuration = {
  mode: isDevelopment ? "development" : "production",
  entry: path.resolve(process.cwd(), "./core/client.tsx"),
  output: {
    filename: "client.js",
    path: path.resolve(process.cwd(), "dist"),
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".mjs"],
    modules: ["node_modules"],
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(mjs|js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            cacheDirectory: true,
            babelrc: true,
          },
        },
      },
      {
        test: /\.(png|ico|ttf|woff2?|eot|otf|svg)$/,
        loader: "file-loader",
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin({
      async: false,
      eslint: {
        files: "core/**/*.{ts,tsx,js,jsx}",
      },
    }),
  ],
  devtool: isDevelopment && "inline-source-map",
};

export default config;
