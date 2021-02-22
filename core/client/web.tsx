import React from "react";
import * as ReactDOM from "react-dom";
import { loadableReady } from "@loadable/component";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";

import App from "./App";
import paginationState from "core/store/paginationState";
import makeInitializeState from "core/utils/makeInitializeState";

loadableReady(async () => {
  const preloadedState = new Map<string, unknown>(window.__PRELOADED_STATE__);
  const pagename = window.__PAGENAME__;
  const apiPagename = window.__API_PAGENAME__;
  delete window.__PRELOADED_STATE__;
  delete window.__PAGENAME__;
  delete window.__API_PAGENAME__;

  const pagemodule = pagename.replace(
    /(.*\/)page\/(?:\d+|index)?$/,
    "$1_paginator"
  );
  const { metadata, preloadStates: pagePreloadStates } = await import(
    `pages/${pagemodule}`
  );
  const layoutname = metadata?.layout ?? "default";
  const layout: Layout =
    typeof layoutname === "string"
      ? (await import(`layouts/${layoutname}`)).default
      : layoutname;

  let preloadStates = layout.PreloadStates;
  if (typeof preloadStates === "function")
    preloadStates = preloadStates(pagename);

  if (pagePreloadStates)
    preloadStates = [...pagePreloadStates, ...preloadStates];

  if (/(.*\/)page\/(?:\d+|index)?$/.test(apiPagename))
    preloadStates = [paginationState(apiPagename), ...preloadStates];

  const initializeState = makeInitializeState(preloadStates, preloadedState);

  const root = document.getElementById("root");
  ReactDOM.hydrate(
    <BrowserRouter>
      <RecoilRoot initializeState={initializeState}>
        <App layout={layoutname} />
      </RecoilRoot>
    </BrowserRouter>,
    root
  );
});
