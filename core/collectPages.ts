import * as glob from "glob";
import path from "path";
import normalizePagename from "./utils/normalizePagename";
import { getExtractor } from "./writePages";

export interface PageMetadata {
  /** 제목 */
  title?: string;
  /** 시각 */
  date?: string;
  /** 태그 */
  tags?: string[];
  /** 레이아웃 */
  layout?: string;
  /** page description */
  description?: string;
  /** page image URL */
  image?: string;
}

export interface Page {
  path: string;
}

export interface PageWithMetadata extends Page {
  metadata: PageMetadata;
}

const collectPages = async (): Promise<PageWithMetadata[]> => {
  const publicPath = "/";
  const files: string[] = glob
    .sync("./pages/**/*.{md,mdx,tsx}")
    .map(fn => path.join(process.cwd(), fn));
  const { getPageMetadata, getStaticPageTextAndImage } = await getExtractor()
    .entryPoint;

  return Promise.all(
    files.map<Promise<PageWithMetadata>>(async file => {
      const filePath = path.parse(file);
      const routePath = path.join(filePath.dir, `${filePath.name}.html`);
      const pagePath = path.join(
        publicPath,
        path.relative(path.join(process.cwd(), "pages"), routePath)
      );
      const pagename = normalizePagename(pagePath);
      let metadata = await getPageMetadata(pagename);

      if (!metadata?.description || !metadata?.image) {
        const rendered = await getStaticPageTextAndImage(pagename, pagePath);
        if (!metadata?.description)
          metadata = { ...metadata, description: rendered.text };
        if (!metadata?.image) metadata = { ...metadata, image: rendered.image };
      }
      return {
        path: pagePath,
        metadata,
      };
    })
  );
};
export default collectPages;
