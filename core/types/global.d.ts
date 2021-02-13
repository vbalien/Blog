export {};
import { Response, RequestInit, RequestInfo } from "node-fetch";

declare global {
  interface Window {
    __PAGE_CONTEXT__: any;
  }
  module globalThis {
    function fetch(url: RequestInfo, init?: RequestInit): Promise<Response>;
  }
}
