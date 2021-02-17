import path from "path";
import fs, { promises as fsPromises } from "fs";
import { Page, PageWithMetadata } from "./collectPages";
import { getExtractor } from "./writePages";
import normalizePagename from "./utils/normalizePagename";

type PostApi = PageWithMetadata & {
  content: string;
  image?: string;
};

export interface PaginationApi {
  currentPage: number;
  perPage: number;
  maxPage: number;
  posts: PostApi[];
}
export type TagsApi = {
  tags: {
    name: string;
    posts: PostApi[];
  }[];
};

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
  const { getPageMetadata, getStaticPageTextAndImage } = await getExtractor()
    .entryPoint;
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
      posts: await Promise.all(
        posts.map(async p => {
          const pagename = normalizePagename(p.path);
          const { text: content, image } = await getStaticPageTextAndImage(
            pagename
          );
          const metadata = await getPageMetadata(pagename);
          return {
            ...p,
            metadata,
            content,
            image,
          };
        })
      ),
    };

    const handle = await fsPromises.open(apiPath, "w");
    await handle.writeFile(JSON.stringify(api), {});
    await handle.close();
    console.info(`Write ${apiPath}`);
  } while (childPages.length >= pageNum * limit);
}

async function writeTagsApi(pages: Page[], basePath: string) {
  const tagsApi: TagsApi = { tags: [] };
  for (const page of pages) {
    const { getPageMetadata, getStaticPageTextAndImage } = await getExtractor()
      .entryPoint;
    const pagename = normalizePagename(page.path);
    const metadata = await getPageMetadata(pagename);
    if (metadata?.tags) {
      const { text: content, image } = await getStaticPageTextAndImage(
        pagename
      );
      for (const tag of metadata.tags) {
        const found = tagsApi.tags.find(t => t.name === tag);
        if (!found)
          tagsApi.tags.push({
            name: tag,
            posts: [{ metadata, content, image, ...page }],
          });
        else found.posts.push({ metadata, content, image, ...page });
      }
    }
  }
  const jsonPath = path.join(basePath, "tags.json");
  const handle = await fsPromises.open(jsonPath, "w");
  await handle.writeFile(JSON.stringify(tagsApi), {});
  await handle.close();
  console.info(`Write ${jsonPath}`);
}

export async function writeApis(pages: Page[]): Promise<void> {
  const basePath = "./dist/";
  if (!fs.existsSync(basePath)) fs.mkdirSync(basePath);
  if (!fs.existsSync(path.join(basePath, "api")))
    fs.mkdirSync(path.join(basePath, "api"));

  await writeTagsApi(pages, basePath);

  for (const page of pages) {
    const apiPath = path.join(basePath, "api", page.path);
    const apiDir = path.parse(apiPath).dir;
    if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir);
    if (/\/_paginator\.html$/.test(page.path)) {
      await writePaginatorApi(basePath, pages, page);
    }
  }
}
