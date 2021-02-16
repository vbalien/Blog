import * as ReactDOMServer from "react-dom/server";
import React from "react";
import fs, { promises as fsPromises } from "fs";
import path from "path";
import { ChunkExtractor, ChunkExtractorManager } from "@loadable/server";
import { StaticRouter } from "react-router-dom";
import { MutableSnapshot, RecoilRoot, RecoilState } from "recoil";

import { Page, PageMetadata, PaginationApi } from "./collectPages";
import { getRecoilState, RecoilStatePortal } from "./utils/RecoilStatePortal";
import normalizePagename from "./utils/normalizePagename";

const template = ({
  body,
  scriptTags,
  linkTags,
  styleTags,
  preloadedState = new Map(),
  pagename,
}: {
  body: string;
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
  <title></title>
  ${linkTags}
  ${styleTags}
  </head>
<body >
  <div id="root">${body}</div>
  <script>
    window.__PRELOADED_STATE__ = ${JSON.stringify(
      Array.from(preloadedState.entries())
    ).replace(/</g, "\\u003c")};
    window.__PAGENAME__ = ${JSON.stringify(pagename).replace(/</g, "\\u003c")};
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
      <StaticRouter location={page.path}>
        <RecoilRoot initializeState={initializeState}>
          <RecoilStatePortal />
          <App />
        </RecoilRoot>
      </StaticRouter>
    </ChunkExtractorManager>
  );
}

async function getState<T = unknown>(state): Promise<T> {
  let content = await getRecoilState<T>(state);
  if (content["__value"] !== undefined && content["__key"] === state.key)
    content = content["__value"];
  return content;
}

async function makeInitializeState(
  states
): Promise<[(snapshot: MutableSnapshot) => void, PreloadedState]> {
  const preloadedState: PreloadedState = new Map();
  for (const stateName of Object.keys(states)) {
    const state = await getState(states[stateName]);
    preloadedState.set(stateName, state);
  }
  return [
    ({ set }) => {
      for (const [key, value] of preloadedState) {
        const layoutState = states[key];
        layoutState && set(layoutState, value);
      }
    },
    preloadedState,
  ];
}

function getExtractor() {
  const nodeStats = path.resolve("./dist/node/loadable-stats.json");
  const webStats = path.resolve("./dist/web/loadable-stats.json");

  const nodeExtractor = new ChunkExtractor({ statsFile: nodeStats });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: Unreachable code error
  const entryPoint: {
    default: React.ComponentType;
    getLayout: (layoutname: string) => Promise<Layout>;
    getPageMetadata: (pagename: string) => Promise<PageMetadata>;
    getPaginationState: (pagename: string) => Promise<PageMetadata>;
  } = nodeExtractor.requireEntrypoint();

  const webExtractor = new ChunkExtractor({ statsFile: webStats });

  return {
    nodeExtractor,
    webExtractor,
    entryPoint,
  };
}

async function getPageStates(
  pagename: string,
  entryPoint
): Promise<Record<string, RecoilState<unknown>>> {
  const metadata = await entryPoint.getPageMetadata(pagename);
  const layoutname = metadata?.layout ?? "default";
  const layout =
    typeof layoutname === "string"
      ? await entryPoint.getLayout(layoutname)
      : layoutname;
  let states = layout.states ?? {};
  if (typeof states === "function") states = states(pagename);

  const paginationState = await entryPoint.getPaginationState();
  if (/(.*\/)page\/(?:\d+|index)?$/.test(pagename))
    states = { paginationState: paginationState(pagename), ...states };
  return states;
}

async function writePaginator(
  basePath: string,
  pages: Page[],
  paginator: Page
) {
  const publicPath = "/";
  const limit = 5;
  const paginatorDir = path.parse(paginator.path).dir;
  const childPages = pages.filter(
    p => p !== paginator && RegExp(`^${paginatorDir}\\/[^\\/]*$`).test(p.path)
  );
  const paginationDir = path.join(basePath, paginatorDir, "page");
  const paginationApiDir = path.join(basePath, "api", paginatorDir, "page");
  if (!fs.existsSync(paginationDir)) fs.mkdirSync(paginationDir);
  if (!fs.existsSync(paginationApiDir)) fs.mkdirSync(paginationApiDir);

  let pageNum = 0;

  do {
    pageNum++;
    const pagePath = path.join(paginationDir, `${pageNum}.html`);
    const apiPath = path.join(paginationApiDir, `${pageNum}.json`);
    const posts = childPages.slice(
      (pageNum - 1) * limit,
      (pageNum - 1) * limit + limit
    );
    const api: PaginationApi = {
      currentPage: pageNum,
      perPage: limit,
      maxPage: Math.floor(childPages.length / limit + 1),
      posts,
    };

    paginator.path = path.join(
      publicPath,
      path.relative(path.join(process.cwd(), "dist"), pagePath)
    );
    const html = await renderPage(paginator);
    let handle = await fsPromises.open(pagePath, "w");
    await handle.writeFile(html, {});
    await handle.close();
    console.info(`Write ${pagePath}`);

    handle = await fsPromises.open(apiPath, "w");
    await handle.writeFile(JSON.stringify(api), {});
    await handle.close();
    console.info(`Write ${apiPath}`);
  } while (childPages.length >= pageNum * limit);

  fs.copyFileSync(
    path.join(paginationDir, `1.html`),
    path.join(paginationDir, `index.html`)
  );
  console.info(`Write ${path.join(paginationDir, `index.html`)}`);
}

async function renderPage(page: Page) {
  const { webExtractor, entryPoint } = getExtractor();
  const pagename = normalizePagename(page.path);
  const states = await getPageStates(pagename, entryPoint);

  renderApp(entryPoint.default, page, webExtractor);

  const [initializeState, preloadedState] = await makeInitializeState(states);
  const body = renderApp(
    entryPoint.default,
    page,
    webExtractor,
    initializeState
  );

  const scriptTags = webExtractor.getScriptTags();
  const linkTags = webExtractor.getLinkTags();
  const styleTags = webExtractor.getStyleTags();

  const html = template({
    body,
    scriptTags,
    linkTags,
    styleTags,
    preloadedState,
    pagename,
  });
  return html;
}

export async function writePages(pages: Page[]): Promise<void> {
  const basePath = "./dist/";
  if (!fs.existsSync(basePath)) fs.mkdirSync(basePath);
  if (!fs.existsSync(path.join(basePath, "api")))
    fs.mkdirSync(path.join(basePath, "api"));

  for (const page of pages) {
    const pagePath = path.join(basePath, page.path);
    const apiPath = path.join(basePath, "api", page.path);
    const pageDir = path.parse(pagePath).dir;
    const apiDir = path.parse(apiPath).dir;
    if (!fs.existsSync(pageDir)) fs.mkdirSync(pageDir);
    if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir);
    if (/\/_paginator\.html$/.test(page.path)) {
      await writePaginator(basePath, pages, page);
    } else {
      const html = await renderPage(page);
      const handle = await fsPromises.open(pagePath, "w");
      await handle.writeFile(html, {});
      await handle.close();
      console.info(`Write ${pagePath}`);
    }
  }
}
