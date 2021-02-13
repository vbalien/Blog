import Bundler from "parcel-bundler";
import ReactDOMServer from "react-dom/server";
import Path from "path";
import { addHook } from "pirates";
import fsPromises from "fs/promises";
import { sync as mdxTransform } from "@mdx-js/mdx";
import { transform as babelTransform, loadOptions } from "babel-core";
import React from "react";
import fetch from "./utils/fetch";
import { App } from "./App";
import getPages from "./getPages";
import PageContext, { PageContextValue } from "./PageContext";

const template = ({
  title,
  body,
  titlePostfix = "",
  titlePrefix = "",
  pageContext,
}: {
  title: string;
  body: string;
  titlePrefix?: string;
  titlePostfix?: string;
  pageContext?: PageContextValue;
}) => `<!DOCTYPE html>
<html lang="en">
  <head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="/static/style.css">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">    
  <title>${titlePrefix}${title}${titlePostfix}</title>
  <script>window.__PAGE_CONTEXT__=${JSON.stringify(pageContext).replace(
    /</g,
    "\\u003c"
  )}</script>
  </head>
<body >
  <div id="root">${body}</div>
  <script  src="./static/client.js" defer></script>
</body>
</html>`;

async function runBuild() {
  const file = Path.join(__dirname, "./client.tsx");
  const bundler = new Bundler(file, {
    outFile: "client.js",
    outDir: "./dist/static",
    sourceMaps: false,
    watch: false,
    minify: true,
  });
  await bundler.bundle();

  const rotues = await getPages();

  for (const route of rotues) {
    const pageContext: PageContextValue = {
      ...route.metadata,
      content: ReactDOMServer.renderToStaticMarkup(<route.component />),
    };
    const html = template({
      title: route.metadata.title,
      body: ReactDOMServer.renderToString(
        <PageContext.Provider value={pageContext}>
          <App />
        </PageContext.Provider>
      ),
      pageContext,
    });
    const handle = await fsPromises.open("./dist/index.html", "w");
    await handle.writeFile(html, {});
  }
}

const transform = (code) => {
  const jsxWithMDXTags = mdxTransform(code);
  const prefix = `import {mdx} from '@mdx-js/react'`;

  const jsx = `
    ${prefix}
    ${jsxWithMDXTags}
  `;

  const result = babelTransform(jsx, loadOptions({ filename: ".babelrc" }));

  return result.code;
};

if (!globalThis.fetch) {
  globalThis.fetch = fetch;
}

addHook(transform, { exts: [".mdx"] });

runBuild();
