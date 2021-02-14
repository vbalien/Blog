import App from "./App";
import React from "react";
import ReactDOM from "react-dom";
import { loadableReady } from "@loadable/component";
import { BrowserRouter } from "react-router-dom";

loadableReady(() => {
  const root = document.getElementById("root");
  ReactDOM.hydrate(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
    root
  );
});
