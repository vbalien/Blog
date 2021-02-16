import fs, { promises as fsPromises } from "fs";
import path from "path";
import * as ReactDOMServer from "react-dom/server";
import React from "react";

import { Page } from "./collectPages";
import { PageState } from "./store/pageState";

export type PageApi = PageState;
export type CategoryApi = {
  name: string;
  total: number;
};
export type CategoriesApi = {
  categories: CategoryApi[];
};
export type TagsApi = {
  tags: string[];
};

export async function makePageApi(page: Page): Promise<PageApi> {
  return {
    ...page.metadata,
    content: ReactDOMServer.renderToStaticMarkup(<page.component />),
  };
}

async function writePageApi(pages: Page[], basePath: string) {
  for (const page of pages) {
    const pagePath = path.parse(path.join(basePath, page.path));
    if (!fs.existsSync(pagePath.dir)) fs.mkdirSync(pagePath.dir);
    const jsonPath = path.join(pagePath.dir, `${pagePath.name}.json`);
    const handle = await fsPromises.open(jsonPath, "w");
    const pageApi = await makePageApi(page);
    await handle.writeFile(JSON.stringify(pageApi), {});
    await handle.close();
    console.info(`Write ${jsonPath}`);
  }
}

async function renderCategoriesAndTagsApi(pages: Page[], basePath: string) {
  const categoriesApi: CategoriesApi = { categories: [] };
  const tagsApi: TagsApi = { tags: [] };
  for (const page of pages) {
    if (page.metadata?.category) {
      const curr = categoriesApi.categories.find(
        c => c.name === page.metadata.category
      );
      if (curr) ++curr.total;
      else
        categoriesApi.categories.push({
          name: page.metadata.category,
          total: 1,
        });
    }
    page.metadata?.tags && tagsApi.tags.push(...page.metadata.tags);
  }
  let jsonPath = path.join(basePath, "categories.json");
  let handle = await fsPromises.open(jsonPath, "w");
  await handle.writeFile(JSON.stringify(categoriesApi), {});
  await handle.close();
  console.info(`Write ${jsonPath}`);

  tagsApi.tags = [...new Set(tagsApi.tags)];
  jsonPath = path.join(basePath, "tags.json");
  handle = await fsPromises.open(jsonPath, "w");
  await handle.writeFile(JSON.stringify(tagsApi), {});
  await handle.close();
  console.info(`Write ${jsonPath}`);
}

export default async function writeApis(pages: Page[]): Promise<void> {
  const basePath = "./dist/api/";
  if (!fs.existsSync(basePath)) fs.mkdirSync(basePath);
  await writePageApi(pages, basePath);
  await renderCategoriesAndTagsApi(pages, basePath);
}
