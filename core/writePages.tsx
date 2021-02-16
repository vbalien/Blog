import * as ReactDOMServer from "react-dom/server";
import React from "react";
import fs, { promises as fsPromises } from "fs";
import path from "path";
import { ChunkExtractor, ChunkExtractorManager } from "@loadable/server";
import { StaticRouter } from "react-router-dom";
import { MutableSnapshot, RecoilRoot } from "recoil";

import { Page } from "./collectPages";
import { getRecoilState, RecoilStatePortal } from "./utils/RecoilStatePortal";
import normalizePagename from "./utils/normalizePagename";

const template = ({
  title,
  body,
  titlePostfix = "",
  titlePrefix = "",
  scriptTags,
  linkTags,
  styleTags,
  preloadedState = new Map(),
  pagename,
}: {
  title: string;
  body: string;
  titlePrefix?: string;
  titlePostfix?: string;
  scriptTags: string;
  linkTags: string;
  styleTags: string;
  preloadedState: PreloadedState;
  pagename: string;
}) => `<!DOCTYPE html>
<html lang="ko">
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titlePrefix}${title}${titlePostfix}</title>
  ${linkTags}
  ${styleTags}
  </head>
<body >
  <div id="root">${body}</div>
  <script>
    window.__PRELOADED_STATE__ = ${JSON.stringify(
      Array.from(preloadedState.entries())
    ).replace(/</g, "\\u003c")}
    window.__PAGENAME__ = ${JSON.stringify(pagename).replace(/</g, "\\u003c")}
  </script>
  ${scriptTags}
</body>
</html>`;

function renderApp(
  App: React.ComponentType,
  page: Page,
  webExtractor: ChunkExtractor,
  initializeState?: (snapshot: MutableSnapshot) => void
) {
  return ReactDOMServer.renderToString(
    <ChunkExtractorManager extractor={webExtractor}>
      <StaticRouter location={`/${page.path}`}>
        <RecoilRoot initializeState={initializeState}>
          <RecoilStatePortal />
          <App />
        </RecoilRoot>
      </StaticRouter>
    </ChunkExtractorManager>
  );
}

async function renderPage(page: Page) {
  const nodeStats = path.resolve("./dist/node/loadable-stats.json");
  const webStats = path.resolve("./dist/web/loadable-stats.json");

  const nodeExtractor = new ChunkExtractor({ statsFile: nodeStats });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: Unreachable code error
  const {
    default: App,
    getLayout,
    getPage,
  }: {
    default: React.ComponentType;
    getLayout: (name: string) => Promise<Layout>;
    getPage: (
      name: string
    ) => Promise<{
      metadata: { layout: string | Layout };
      default: React.ComponentType;
    }>;
  } = nodeExtractor.requireEntrypoint();

  const webExtractor = new ChunkExtractor({ statsFile: webStats });

  const pagename = normalizePagename(page.path);
  const { metadata } = await getPage(pagename);

  const layoutname = metadata?.layout ?? "default";
  const layout =
    typeof layoutname === "string" ? await getLayout(layoutname) : layoutname;

  let states = layout.states ?? {};
  if (typeof states === "function") states = states(pagename);

  renderApp(App, page, webExtractor);

  const preloadedState: PreloadedState = new Map();

  for (const stateName of Object.keys(states)) {
    let content = await getRecoilState(states[stateName]);

    if (
      content["__value"] !== undefined &&
      content["__key"] === states[stateName].key
    )
      content = content["__value"];

    preloadedState.set(stateName, content);
  }

  const body = renderApp(App, page, webExtractor, ({ set }) => {
    for (const [key, value] of preloadedState) {
      const layoutState = states[key];
      layoutState && set(layoutState, value);
    }
  });

  const scriptTags = webExtractor.getScriptTags();
  const linkTags = webExtractor.getLinkTags();
  const styleTags = webExtractor.getStyleTags();

  const html = template({
    title: page.metadata?.title,
    body,
    scriptTags,
    linkTags,
    styleTags,
    preloadedState,
    pagename: normalizePagename(page.path),
  });
  return html;
}

export async function writePages(pages: Page[]): Promise<void> {
  const basePath = "./dist/";
  if (!fs.existsSync(basePath)) fs.mkdirSync(basePath);

  for (const page of pages) {
    const pagePath = path.join(basePath, page.path);
    const pageDir = path.parse(pagePath).dir;
    if (!fs.existsSync(pageDir)) fs.mkdirSync(pageDir);
    const html = await renderPage(page);
    const handle = await fsPromises.open(pagePath, "w");
    await handle.writeFile(html, {});
    await handle.close();
    console.info(`Write ${pagePath}`);
  }
}
