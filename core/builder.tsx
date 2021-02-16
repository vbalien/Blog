import { addHook } from "pirates";
import { sync as mdxTransform } from "@mdx-js/mdx";
import { transform as babelTransform, loadOptions } from "babel-core";
import { webpack } from "webpack";

import webpackConfig from "./webpack.config";
import { writePages } from "./writePages";
import collectPages from "./collectPages";
import fetch from "./utils/fetch";

function webpackBuild() {
  return new Promise<MultiStats>((resolve, reject) => {
    webpack(webpackConfig, (err, stats) => {
      if (err) {
        reject(err);
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
  await writePages(pages);
}

addHook(
  code => {
    const jsxWithMDXTags = mdxTransform(code);
    const prefix = `import {mdx} from '@mdx-js/react'`;

    const jsx = `
    ${prefix}
    ${jsxWithMDXTags}
  `;
    const result = babelTransform(jsx, loadOptions({ filename: ".babelrc" }));
    return result.code;
  },
  { exts: [".mdx", ".md"] }
);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unreachable code error
globalThis.fetch ?? (globalThis.fetch = fetch);

runBuild();
