import React from "react";
import * as ReactDOM from "react-dom";
import { loadableReady } from "@loadable/component";
import { BrowserRouter } from "react-router-dom";
import { MutableSnapshot, RecoilRoot } from "recoil";

import App from "./App";
import { PageState } from "core/store/pageState";

loadableReady(async () => {
  const preloadedState = new Map<string, unknown>(window.__PRELOADED_STATE__);
  const pageState: Partial<PageState> = preloadedState.get("pageState");
  const layout: Layout = await import(
    `layouts/${pageState.layout ?? "default"}`
  );

  function initializeState({ set }: MutableSnapshot) {
    for (const state of preloadedState) {
      const layoutState = layout.states[state[0]];
      layoutState && set(layoutState, state[1]);
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
