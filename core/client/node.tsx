import { PageMetadata } from "core/collectPages";
import { PaginationApi } from "core/writeApis";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Route, StaticRouter, Switch } from "react-router-dom";
import { RecoilRoot, RecoilState } from "recoil";

export { default } from "./App";

export const getLayout = async (name: string): Promise<Layout> =>
  (await import(`layouts/${name ?? "default"}`)).default;

export const getPageMetadata = async (
  pagename: string
): Promise<PageMetadata> => {
  return (await import(`pages/${pagename}`)).metadata;
};

export const getStaticPageTextAndImage = async (
  pagename: string,
  path: string
): Promise<{ text: string; image: string }> => {
  const Page = (await import(`pages/${pagename}`)).default;
  const html = renderToStaticMarkup(
    <StaticRouter location={path}>
      <RecoilRoot>
        <Switch>
          <Route exact path={[":page(^)", "/:page(.*)"]}>
            <Page />
          </Route>
        </Switch>
      </RecoilRoot>
    </StaticRouter>
  );
  const text = html.replace(/<[^<]*?>/g, " ").slice(0, 150);
  const imageMatch = html.match(/<img[\s]+src=((?:".*?")|(?:'.*?')).*?>/i);
  const image = imageMatch && imageMatch[1].slice(1, -1);
  return {
    text,
    image,
  };
};

export const getPaginationState = async (): Promise<
  (apiPath: string) => RecoilState<PaginationApi>
> => (await import("core/client/store/paginationState")).default;

export const getPageState = async (): Promise<RecoilState<PageMetadata>> =>
  (await import("core/client/store/pageState")).default;

export const getPagePreloadStates = async (
  pagename: string
): Promise<RecoilState<unknown>[]> =>
  (await import(`pages/${pagename}`)).preloadStates;
