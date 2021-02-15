import { atomFamily } from "recoil";
import { PageMetadata } from "../collectPages";

export interface PageState extends PageMetadata {
  content: string;
}

export const pageState = atomFamily<PageState, string>({
  key: "pageState",
  default: page =>
    (async page => {
      return await (await fetch(`api/${page}.json`)).json();
    })(page),
});
