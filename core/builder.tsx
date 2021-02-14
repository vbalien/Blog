import { addHook } from "pirates";
import { sync as mdxTransform } from "@mdx-js/mdx";
import { transform as babelTransform, loadOptions } from "babel-core";
import { webpack } from "webpack";

import webpackConfig from "./webpack.config";
import writeApis from "./writeApis";
import { writePages } from "./writePages";

function webpackBuild() {
  return new Promise((resolve, reject) => {
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

  console.log(webpackStats.toString());

  await writeApis();
  await writePages();
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
