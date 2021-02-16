import React from "react";
import * as ReactDOM from "react-dom";
import { loadableReady } from "@loadable/component";
import { BrowserRouter } from "react-router-dom";
import { MutableSnapshot, RecoilRoot } from "recoil";

import App from "./App";
import paginationState from "core/store/paginationState";

loadableReady(async () => {
  const preloadedState = new Map<string, unknown>(window.__PRELOADED_STATE__);
  const pagename = window.__PAGENAME__;
  delete window.__PRELOADED_STATE__;
  delete window.__PAGENAME__;

  const pagemodule = pagename.replace(
    /(.*\/)page\/[^\\/]*(?:\d+|index)?$/,
    "$1_paginator"
  );
  const { metadata } = await import(`pages/${pagemodule}`);
  const layoutname = metadata?.layout ?? "default";
  const layout =
    typeof layoutname === "string"
      ? (await import(`layouts/${layoutname}`)).default
      : layoutname;

  let states = layout.states;
  if (typeof states === "function") states = states(pagename);
  if (/(.*\/)page\/(?:\d+|index)?$/.test(pagename))
    states = { paginationState: paginationState(pagename), ...states };

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
