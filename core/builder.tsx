import { webpack } from "webpack";

import webpackConfig from "./webpack.config";
import { writePages } from "./writePages";
import collectPages from "./collectPages";
import fetch from "./utils/fetch";
import { writeApis } from "./writeApis";
import { glob } from "glob";
import path from "path";
import { copyFileSync, existsSync, lstatSync, mkdirSync } from "fs";

function webpackBuild() {
  return new Promise<MultiStats>((resolve, reject) => {
    webpack(webpackConfig, (err, stats) => {
      if (err) {
        reject(err);
        return;
      } else if (stats.hasErrors()) {
        reject(
          stats.toString({
            chunks: false,
            colors: true,
          })
        );
        return;
      }
      resolve(stats);
    });
  });
}

function assetsCopy() {
  const basePath = "./dist/";
  const assets = glob
    .sync("pages/**/*[!{.tsx|.md|.mdx}]")
    .filter(f => !lstatSync(f).isDirectory())
    .map(f => path.relative(path.join(process.cwd(), "pages"), f));
  for (const assetPath of assets) {
    const srcPath = path.join("pages", assetPath);
    const distPath = path.join(basePath, assetPath);
    if (!existsSync(path.parse(distPath).dir))
      mkdirSync(path.parse(distPath).dir, { recursive: true });
    copyFileSync(srcPath, distPath);
    console.info(`Copy ${distPath}`);
  }
}

async function runBuild() {
  const webpackStats = await webpackBuild();

  console.info(
    webpackStats.toString({
      chunks: false,
      colors: true,
    })
  );

  assetsCopy();

  const pages = await collectPages();
  await writeApis(pages);
  await writePages(pages);
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unreachable code error
globalThis.fetch ?? (globalThis.fetch = fetch);

runBuild();
