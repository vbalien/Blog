import * as ReactDOMServer from "react-dom/server";
import React from "react";
import fs, { promises as fsPromises } from "fs";
import path from "path";
import { ChunkExtractor, ChunkExtractorManager } from "@loadable/server";
import { StaticRouter } from "react-router-dom";
import { MutableSnapshot, RecoilRoot, RecoilState } from "recoil";
import { Helmet, HelmetData } from "react-helmet";

import { Page, PageMetadata, PageWithMetadata } from "./collectPages";
import { getRecoilState, RecoilStatePortal } from "./utils/RecoilStatePortal";
import normalizePagename from "./utils/normalizePagename";
import makeInitializeState from "./utils/makeInitializeState";
import fetch from "./utils/fetch";
import { TagsApi } from "./writeApis";

const template = ({
  helmet,
  body,
  scriptTags,
  linkTags,
  styleTags,
  preloadedState = new Map(),
  pagePath,
  pageMetadata,
}: {
  helmet: HelmetData;
  body: string;
  scriptTags: string;
  linkTags: string;
  styleTags: string;
  preloadedState: PreloadedState;
  pagePath: string;
  pageMetadata: PageMetadata;
}) => `<!DOCTYPE html>
<html ${helmet.htmlAttributes.toString()}>
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${helmet.title.toString()}
  ${helmet.meta.toString()}
  ${helmet.link.toString()}
  ${linkTags}
  ${styleTags}
  </head>
<body ${helmet.bodyAttributes.toString()}>
  <div id="root">${body}</div>
  <script>
    window.__PRELOADED_STATE__ = ${JSON.stringify(
      Array.from(preloadedState.entries())
    ).replace(/</g, "\\u003c")};
    window.__PAGENAME__ = ${JSON.stringify(normalizePagename(pagePath)).replace(
      /</g,
      "\\u003c"
    )};
    window.__API_PAGENAME__ = ${JSON.stringify(
      normalizePagename(pagePath, { ignorePaginator: true })
    ).replace(/</g, "\\u003c")};
    window.__PAGE_METADATA__ = ${JSON.stringify(pageMetadata).replace(
      /</g,
      "\\u003c"
    )};
  </script>
  ${scriptTags}
</body>
</html>`;

function renderApp(
  App: React.ComponentType<{ layout: string }>,
  page: PageWithMetadata,
  webExtractor: ChunkExtractor,
  initializeState?: (snapshot: MutableSnapshot) => void
) {
  return ReactDOMServer.renderToString(
    <ChunkExtractorManager extractor={webExtractor}>
      <StaticRouter location={page.path}>
        <RecoilRoot initializeState={initializeState}>
          <RecoilStatePortal />
          <App layout={page.metadata?.layout ?? "default"} />
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

export function getExtractor(): {
  entryPoint: EntryPoint;
  nodeExtractor: ChunkExtractor;
  webExtractor: ChunkExtractor;
} {
  const nodeStats = path.resolve("./dist/node/loadable-stats.json");
  const webStats = path.resolve("./dist/web/loadable-stats.json");

  const nodeExtractor = new ChunkExtractor({ statsFile: nodeStats });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: Unreachable code error
  const entryPoint: EntryPoint = nodeExtractor.requireEntrypoint();

  const webExtractor = new ChunkExtractor({ statsFile: webStats });

  return {
    nodeExtractor,
    webExtractor,
    entryPoint,
  };
}

async function getPageStates(
  pagePath: string,
  entryPoint: EntryPoint
): Promise<RecoilState<unknown>[]> {
  const pagename = normalizePagename(pagePath);
  const apiPagename = normalizePagename(pagePath, {
    ignorePaginator: true,
  });
  const metadata = await entryPoint.getPageMetadata(pagename);
  const layoutname = metadata?.layout ?? "default";
  const layout: Layout =
    typeof layoutname === "string"
      ? await entryPoint.getLayout(layoutname)
      : layoutname;
  let preloadStates = layout.PreloadStates ?? [];
  if (typeof preloadStates === "function")
    preloadStates = preloadStates(pagename);

  const pagePreloadStates =
    (await entryPoint.getPagePreloadStates(pagename)) ?? [];

  preloadStates = [...preloadStates, ...pagePreloadStates];

  const paginationState = await entryPoint.getPaginationState();

  if (/(.*\/)page\/(?:\d+|index)?$/.test(apiPagename)) {
    const apiPath = normalizePagename(apiPagename, {
      ignorePaginator: true,
    }).replace(/index$/i, "1");
    preloadStates = [paginationState(apiPath), ...preloadStates];
  }
  return preloadStates;
}

async function writeTagsPaginator(
  basePath: string,
  pages: Page[],
  paginator: PageWithMetadata
) {
  const paginatorPath = paginator.path;
  const { getPageMetadata } = await getExtractor().entryPoint;
  const pagesWithMetadata: PageWithMetadata[] = await Promise.all(
    pages.map(async p => {
      const pagename = normalizePagename(p.path);
      const metadata = await getPageMetadata(pagename);
      return {
        ...p,
        metadata,
      };
    })
  );
  const tagsApi: TagsApi = await (await fetch("/api/tags.json")).json();

  for (const tag of tagsApi.tags) {
    const paginatorDir = path.parse(paginatorPath).dir;
    paginator.path = path.join(
      paginatorDir,
      encodeURIComponent(tag),
      "_paginator.html"
    );
    const childPages = pagesWithMetadata.filter(p =>
      p.metadata?.tags?.includes(tag)
    );
    await writePaginator(basePath, childPages, paginator);
  }
}

async function writePaginator(
  basePath: string,
  childPages: Page[],
  paginator: PageWithMetadata
) {
  const publicPath = "/";
  const limit = 5;
  const paginatorDir = path.parse(paginator.path).dir;
  const paginationDir = path.join(basePath, paginatorDir, "page");
  if (!fs.existsSync(paginationDir))
    fs.mkdirSync(paginationDir, { recursive: true });

  let pageNum = 0;

  do {
    pageNum++;
    const pagePath = path.join(paginationDir, `${pageNum}.html`);

    paginator.path = path.join(
      publicPath,
      path.relative(path.join(process.cwd(), "dist"), pagePath)
    );
    const html = await renderPage(paginator);
    const handle = await fsPromises.open(pagePath, "w");
    await handle.writeFile(html, {});
    await handle.close();
    console.info(`Write ${pagePath}`);
  } while (childPages.length >= pageNum * limit);

  fs.copyFileSync(
    path.join(paginationDir, `1.html`),
    path.join(paginationDir, `index.html`)
  );
  console.info(`Write ${path.join(paginationDir, `index.html`)}`);
}

async function renderPage(page: PageWithMetadata) {
  const { webExtractor, entryPoint } = getExtractor();
  const preloadStates = await getPageStates(page.path, entryPoint);
  renderApp(entryPoint.default, page, webExtractor);

  const preloadedState: PreloadedState = new Map();
  for (const state of preloadStates) {
    const stateContent = await getState(state);
    preloadedState.set(state.key, stateContent);
  }

  const initializeState = makeInitializeState(preloadStates, preloadedState, {
    pageMetadata: page.metadata,
    pageState: await entryPoint.getPageState(),
  });
  const body = renderApp(
    entryPoint.default,
    page,
    webExtractor,
    initializeState
  );

  const helmet = Helmet.renderStatic();
  const scriptTags = webExtractor.getScriptTags();
  const linkTags = webExtractor.getLinkTags();
  const styleTags = webExtractor.getStyleTags();

  const html = template({
    helmet,
    body,
    scriptTags,
    linkTags,
    styleTags,
    preloadedState,
    pagePath: page.path,
    pageMetadata: page.metadata,
  });
  return html;
}

export async function writePages(pages: PageWithMetadata[]): Promise<void> {
  const basePath = "./dist/";

  for (const page of pages) {
    const pagePath = path.join(basePath, page.path);
    const pageDir = path.parse(pagePath).dir;
    if (!fs.existsSync(pageDir)) fs.mkdirSync(pageDir, { recursive: true });
    if (/\/_paginator\.html$/.test(page.path)) {
      if (page.path === "/tags/_paginator.html")
        await writeTagsPaginator(basePath, pages, page);
      else {
        const paginatorDir = path.parse(page.path).dir;
        const childPages = pages.filter(
          p => p !== page && RegExp(`^${paginatorDir}\\/[^\\/]*$`).test(p.path)
        );
        await writePaginator(basePath, childPages, page);
      }
    } else {
      const html = await renderPage(page);
      const handle = await fsPromises.open(pagePath, "w");
      await handle.writeFile(html, {});
      await handle.close();
      console.info(`Write ${pagePath}`);
    }
  }
}
