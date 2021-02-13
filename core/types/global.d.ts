import { RequestInfo, RequestInit, Response } from "node-fetch";
import { PageContextValue } from "~core/PageContext";

declare global {
  namespace Window {
    const __PAGE_CONTEXT__: PageContextValue;
  }
  namespace globalThis {
    function fetch(url: RequestInfo, init?: RequestInit): Promise<Response>;
  }
}
