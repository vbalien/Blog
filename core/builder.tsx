import { webpack } from "webpack";

import webpackConfig from "./webpack.config";
import { writePages } from "./writePages";
import collectPages from "./collectPages";
import fetch from "./utils/fetch";
import { writeApis } from "./writeApis";

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

async function runBuild() {
  const webpackStats = await webpackBuild();

  console.info(
    webpackStats.toString({
      chunks: false,
      colors: true,
    })
  );

  const pages = await collectPages();
  await writeApis(pages);
  await writePages(pages);
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unreachable code error
globalThis.fetch ?? (globalThis.fetch = fetch);

runBuild();
