import path from "path";
import nodeExternals from "webpack-node-externals";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import webpack from "webpack";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import LoadablePlugin from "@loadable/webpack-plugin";

const DIST_PATH = path.resolve(process.cwd(), "dist");
const production = process.env.NODE_ENV === "production";
const development =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development";

const getConfig = (target: string): webpack.Configuration => ({
  mode: development ? "development" : "production",
  target,
  entry: `./core/client/${target}.tsx`,
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
            caller: { target },
          },
        },
      },
      {
        test: /\.(png|ico|ttf|woff2?|eot|otf|svg)$/,
        loader: "file-loader",
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
    // filename: production ? '[name]-bundle-[chunkhash:8].js' : '[name].js',
    filename: production ? "[name].js" : "[name].js",
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
  ],
});

export default [getConfig("node"), getConfig("web")];
