import { PageMetadata } from "core/collectPages";
import { PaginationApi } from "core/writeApis";
import { RequestInfo, RequestInit, Response } from "node-fetch";
import { RecoilState } from "recoil";

declare global {
  function fetch(url: RequestInfo, init?: RequestInit): Promise<Response>;

  abstract class MultiStats {
    toString(options?: {
      /** Makes the build much quieter */
      chunks: boolean;
      /** Shows colors in the console */
      colors: boolean;
    }): string;
  }

  type EntryPoint = {
    default: React.ComponentType<{ layout: string }>;
    getLayout: (layoutname: string) => Promise<Layout>;
    getPageMetadata: (pagename: string) => Promise<PageMetadata>;
    getPaginationState: () => Promise<
      (apiPath: string) => RecoilState<PaginationApi>
    >;
    getStaticPageTextAndImage: (
      pagename: string
    ) => Promise<{ text: string; image: string }>;
    getPagePreloadStates: (pagename: string) => Promise<RecoilState<unknown>[]>;
  };

  type Layout<P = unknown> = React.FC<P> & {
    PreloadStates:
      | RecoilState<unknown>[]
      | ((pagename: string) => RecoilState<unknown>[]);
  };

  type PreloadedState = Map<string, unknown>;

  interface Window {
    __PRELOADED_STATE__: [];
    __PAGENAME__: string;
    __API_PAGENAME__: string;
  }

  type TemplateResult = { path: string; filename: string; content: string };
  type Template = (props: {
    title: string;
    slug: string;
    date: Date;
    tags: string[];
  }) => TemplateResult;
}
