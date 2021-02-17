import path from "path";
import fs, { promises as fsPromises } from "fs";
import { Page } from "./collectPages";

type PostApi = Page;

export interface PaginationApi {
  currentPage: number;
  perPage: number;
  maxPage: number;
  posts: PostApi[];
}

async function writePaginatorApi(
  basePath: string,
  pages: Page[],
  paginator: Page
): Promise<void> {
  const limit = 5;
  const paginatorDir = path.parse(paginator.path).dir;
  const childPages = pages.filter(
    p => p !== paginator && RegExp(`^${paginatorDir}\\/[^\\/]*$`).test(p.path)
  );
  const paginationApiDir = path.join(basePath, "api", paginatorDir, "page");
  if (!fs.existsSync(paginationApiDir)) fs.mkdirSync(paginationApiDir);

  let pageNum = 0;
  do {
    pageNum++;
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

    const handle = await fsPromises.open(apiPath, "w");
    await handle.writeFile(JSON.stringify(api), {});
    await handle.close();
    console.info(`Write ${apiPath}`);
  } while (childPages.length >= pageNum * limit);
}

export async function writeApis(pages: Page[]): Promise<void> {
  const basePath = "./dist/";
  if (!fs.existsSync(basePath)) fs.mkdirSync(basePath);
  if (!fs.existsSync(path.join(basePath, "api")))
    fs.mkdirSync(path.join(basePath, "api"));

  for (const page of pages) {
    const apiPath = path.join(basePath, "api", page.path);
    const apiDir = path.parse(apiPath).dir;
    if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir);
    if (/\/_paginator\.html$/.test(page.path)) {
      await writePaginatorApi(basePath, pages, page);
    }
  }
}
