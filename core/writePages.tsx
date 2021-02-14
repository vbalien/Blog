import ReactDOMServer from "react-dom/server";
import React from "react";
import fs, { promises as fsPromises } from "fs";
import path from "path";
import { ChunkExtractor, ChunkExtractorManager } from "@loadable/server";
import { StaticRouter } from "react-router-dom";

import getPages, { Page } from "./getPages";

const template = ({
  title,
  body,
  titlePostfix = "",
  titlePrefix = "",
  scriptTags,
  linkTags,
  styleTags,
}: {
  title: string;
  body: string;
  titlePrefix?: string;
  titlePostfix?: string;
  scriptTags: string;
  linkTags: string;
  styleTags: string;
}) => `<!DOCTYPE html>
<html lang="en">
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titlePrefix}${title}${titlePostfix}</title>
  ${linkTags}
  ${styleTags}
  </head>
<body >
  <div id="root">${body}</div>
  ${scriptTags}
</body>
</html>`;

async function renderPage(page: Page) {
  const nodeStats = path.resolve("./dist/node/loadable-stats.json");
  const webStats = path.resolve("./dist/web/loadable-stats.json");

  const nodeExtractor = new ChunkExtractor({ statsFile: nodeStats });
  const { default: App } = nodeExtractor.requireEntrypoint();

  const webExtractor = new ChunkExtractor({ statsFile: webStats });

  const body = ReactDOMServer.renderToString(
    <ChunkExtractorManager extractor={webExtractor}>
      <StaticRouter location={page.path}>
        <App />
      </StaticRouter>
    </ChunkExtractorManager>
  );

  const scriptTags = webExtractor.getScriptTags();
  const linkTags = webExtractor.getLinkTags();
  const styleTags = webExtractor.getStyleTags();

  const html = template({
    title: page.metadata.title,
    body,
    scriptTags,
    linkTags,
    styleTags,
  });
  return html;
}

export async function writePages(): Promise<void> {
  const basePath = "./dist/";
  if (!fs.existsSync(basePath)) fs.mkdirSync(basePath);

  const pages = await getPages();
  for (const page of pages) {
    const pagePath = path.join(basePath, page.path);
    const pageDir = path.parse(pagePath).dir;
    if (!fs.existsSync(pageDir)) fs.mkdirSync(pageDir);
    const html = await renderPage(page);
    const handle = await fsPromises.open(pagePath, "w");
    await handle.writeFile(html, {});
    console.log(`Write ${pagePath}`);
  }
}
