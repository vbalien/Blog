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

  interface Layout {
    default: React.ComponentType;
    states:
      | { [name: string]: RecoilState<unknown> }
      | ((pagename: string) => { [name: string]: RecoilState<unknown> });
  }

  type PreloadedState = Map<string, unknown>;

  interface Window {
    __PRELOADED_STATE__: [];
    __PAGENAME__: string;
  }
}
