import glob from "glob";
import path from "path";
import React from "react";

export interface PageMetadata {
  /** 제목 */
  title?: string;
  /** 작성자 */
  author?: string;
  /** 시각 */
  date?: string;
  /** 카테고리 */
  category?: string;
  /** 태그 */
  tags?: string[];
}

export interface Page {
  path: string;
  component: React.ElementType;
  metadata: PageMetadata;
}

const getPages = (): Promise<Page[]> => {
  const files: string[] = glob
    .sync("./pages/**/*.mdx")
    .map(fn => path.join(process.cwd(), fn));

  return Promise.all(
    files.map<Promise<Page>>(async file => {
      const page = await import(file);
      return {
        path: path.relative(path.join(process.cwd(), "pages"), file),
        metadata: page.metadata,
        component: page.default,
      };
    })
  );
};
export default getPages;
