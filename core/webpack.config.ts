import path from "path";
import nodeExternals from "webpack-node-externals";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import * as webpack from "webpack";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import LoadablePlugin from "@loadable/webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

const DIST_PATH = path.resolve(process.cwd(), "dist");
const production = process.env.NODE_ENV === "production";
const development =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development";

const getConfig = (target: string): webpack.Configuration => ({
  name: target,
  mode: development ? "development" : "production",
  target,
  entry: `./core/client/${target}.tsx`,
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".mjs", ".md", ".mdx"],
    modules: [process.cwd(), "node_modules"],
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          target === "web" && {
            loader: MiniCssExtractPlugin.loader,
          },
          "css-loader",
        ].filter(Boolean),
      },
      {
        test: /\.(mjs|js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            caller: { target },
          },
        },
      },
      {
        test: /\.(png|ico|ttf|woff2?|eot|otf|svg)$/,
        loader: "file-loader",
      },
      {
        test: /\.mdx?$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              caller: { target },
            },
          },
          "@mdx-js/loader",
        ],
      },
    ],
  },
  optimization: {
    moduleIds: "named",
    chunkIds: "named",
  },
  externals:
    target === "node" ? ["@loadable/component", nodeExternals()] : undefined,
  output: {
    path: path.join(DIST_PATH, target),
    filename: production ? "[name]-bundle-[chunkhash:8].js" : "[name].js",
    publicPath: `/${target}/`,
    libraryTarget: target === "node" ? "commonjs2" : undefined,
  },
  plugins: [
    new CleanWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin({
      async: false,
      eslint: {
        files: "core/**/*.{ts,tsx,js,jsx}",
      },
    }),
    new LoadablePlugin(),
    new MiniCssExtractPlugin(),
  ],
  performance: production
    ? {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000,
      }
    : undefined,
});

export default [getConfig("node"), getConfig("web")];
