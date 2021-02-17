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
  tags: string[];
};

async function writePaginatorApi(
  basePath: string,
  childPages: Page[],
  paginatorDir: string
): Promise<void> {
  const limit = 5;
  const paginationApiDir = path.join(basePath, "api", paginatorDir, "page");
  const { getPageMetadata, getStaticPageTextAndImage } = await getExtractor()
    .entryPoint;
  if (!fs.existsSync(paginationApiDir))
    fs.mkdirSync(paginationApiDir, { recursive: true });

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
  const { getPageMetadata } = await getExtractor().entryPoint;
  const tagsApi: TagsApi = { tags: [] };
  const apiPath = path.join(basePath, "api");
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
  for (const page of pagesWithMetadata)
    page.metadata?.tags && tagsApi.tags.push(...page.metadata?.tags);
  tagsApi.tags = [...new Set(tagsApi.tags)];
  const jsonPath = path.join(apiPath, "tags.json");
  const handle = await fsPromises.open(jsonPath, "w");
  await handle.writeFile(JSON.stringify(tagsApi), {});
  await handle.close();
  console.info(`Write ${jsonPath}`);

  const tagPath = path.join(apiPath, "tags");
  if (!fs.existsSync(tagPath)) fs.mkdirSync(tagPath);

  for (const tag of tagsApi.tags) {
    const childPages = pagesWithMetadata.filter(p =>
      p.metadata?.tags?.includes(tag)
    );
    await writePaginatorApi(basePath, childPages, `tags/${tag}`);
  }
}

export async function writeApis(pages: Page[]): Promise<void> {
  const basePath = "./dist/";
  if (!fs.existsSync(basePath)) fs.mkdirSync(basePath);
  if (!fs.existsSync(path.join(basePath, "api")))
    fs.mkdirSync(path.join(basePath, "api"), { recursive: true });

  await writeTagsApi(pages, basePath);

  for (const page of pages) {
    const apiPath = path.join(basePath, "api", page.path);
    const apiDir = path.parse(apiPath).dir;
    if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir);
    if (/\/_paginator\.html$/.test(page.path)) {
      const paginatorDir = path.parse(page.path).dir;
      const childPages = pages.filter(
        p => p !== page && RegExp(`^${paginatorDir}\\/[^\\/]*$`).test(p.path)
      );
      await writePaginatorApi(basePath, childPages, paginatorDir);
    }
  }
}
