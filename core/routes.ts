import glob from "glob";
import path from "path";

export interface PageMetadata {
  /** 제목 */
  title: string;
  /** 작성자 */
  author: string;
  /** 시각 */
  date: string;
}

interface Route {
  path: string;
  component: React.ElementType;
  metadata: PageMetadata;
}

export const getRotues = (): Route[] =>
  glob.sync("./pages/**/*.mdx").map<Route>((file) => {
    const page = require(path.resolve(process.cwd(), file));
    return {
      path: path.dirname(file),
      metadata: page.metadata,
      component: page.default,
    };
  });
