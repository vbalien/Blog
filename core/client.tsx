import { App } from "./App";
import PageContext from "./PageContext";
import React from "react";
import ReactDOM from "react-dom";

const pageContext = window.__PAGE_CONTEXT__;
delete window.__PAGE_CONTEXT__;

ReactDOM.hydrate(
  <PageContext.Provider value={pageContext}>
    <App />
  </PageContext.Provider>,
  document.getElementById("root")
);
