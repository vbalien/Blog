import { addHook } from "pirates";
import { sync as mdxTransform } from "@mdx-js/mdx";
import { transform as babelTransform, loadOptions } from "babel-core";
import { Stats, webpack } from "webpack";

import fetch from "./utils/fetch";
import webpackConfig from "./webpack.config";
import writeApis from "./writeApis";
import { writePages } from "./writePages";

function webpackBuild(): Promise<Stats> {
  const compiler = webpack(webpackConfig);
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
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

  console.log(
    webpackStats.toString({
      chunks: false, // Makes the build much quieter
      colors: true, // Shows colors in the console
    })
  );

  await writeApis();
  await writePages();
}

if (!globalThis.fetch) {
  globalThis.fetch = fetch;
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
  { exts: [".mdx"] }
);

runBuild();
