import React from "react";
import * as ReactDOM from "react-dom";
import { loadableReady } from "@loadable/component";
import { BrowserRouter } from "react-router-dom";
import { MutableSnapshot, RecoilRoot } from "recoil";

import App from "./App";
import { PageState } from "core/store/pageState";

loadableReady(async () => {
  const preloadedState = new Map<string, unknown>(window.__PRELOADED_STATE__);
  const pagename = window.__PAGENAME__;
  delete window.__PRELOADED_STATE__;
  delete window.__PAGENAME__;

  const pageState: Partial<PageState> = preloadedState.get("pageState");
  const layout: Layout = await import(
    `layouts/${pageState.layout ?? "default"}`
  );
  let states = layout.states;
  if (typeof states === "function") states = states(pagename);

  function initializeState({ set }: MutableSnapshot) {
    for (const [key, value] of preloadedState) {
      const layoutState = states[key];
      layoutState && set(layoutState, value);
    }
  }

  const root = document.getElementById("root");
  ReactDOM.hydrate(
    <BrowserRouter>
      <RecoilRoot initializeState={initializeState}>
        <App />
      </RecoilRoot>
    </BrowserRouter>,
    root
  );
});
