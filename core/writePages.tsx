import PageContext, { PageContextValue } from "./PageContext";
import ReactDOMServer from "react-dom/server";
import React from "react";
import fs, { promises as fsPromises } from "fs";
import path from "path";

import { App } from "./App";
import getPages, { Page } from "./getPages";

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
  <script  src="./client.js" defer></script>
</body>
</html>`;

async function renderPage(page: Page) {
  const pageContext: PageContextValue = {
    ...page.metadata,
    content: ReactDOMServer.renderToStaticMarkup(<page.component />),
  };
  const html = template({
    title: page.metadata.title,
    body: ReactDOMServer.renderToString(
      <PageContext.Provider value={pageContext}>
        <App />
      </PageContext.Provider>
    ),
    pageContext,
  });
  return html;
}

export async function writePages(): Promise<void> {
  const basePath = "./dist/";
  if (!fs.existsSync(basePath)) fs.mkdirSync(basePath);

  const pages = await getPages();
  for (const page of pages) {
    const pagePath = path.parse(path.join(basePath, page.path));
    if (!fs.existsSync(pagePath.dir)) fs.mkdirSync(pagePath.dir);
    const htmlPath = path.join(pagePath.dir, `${pagePath.name}.html`);
    const html = await renderPage(page);
    const handle = await fsPromises.open(htmlPath, "w");
    await handle.writeFile(html, {});
    console.log(`Write ${htmlPath}`);
  }
}
