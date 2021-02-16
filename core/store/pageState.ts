import { atomFamily } from "recoil";
import { PageMetadata } from "../collectPages";

export interface PageState extends PageMetadata {
  content?: string;
}

export const pageState = atomFamily<PageState, string>({
  key: "pageState",
  default: page =>
    (async page => {
      page = page.replace(/\.html$/, ".json");
      return await (await fetch(`/api/${page}`)).json();
    })(page),
});
