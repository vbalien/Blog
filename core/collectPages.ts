import * as glob from "glob";
import path from "path";

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
  /** 레이아웃 */
  layout?: string;
}

export interface Page {
  path: string;
}

const collectPages = (): Promise<Page[]> => {
  const publicPath = "/";
  const files: string[] = glob
    .sync("./pages/**/*.{md,mdx,tsx}")
    .map(fn => path.join(process.cwd(), fn));

  return Promise.all(
    files.map<Promise<Page>>(async file => {
      const filePath = path.parse(file);
      const routePath = path.join(filePath.dir, `${filePath.name}.html`);
      return {
        path: path.join(
          publicPath,
          path.relative(path.join(process.cwd(), "pages"), routePath)
        ),
      };
    })
  );
};
export default collectPages;
