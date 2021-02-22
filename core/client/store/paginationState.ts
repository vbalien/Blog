import { PaginationApi } from "core/writeApis";
import { atomFamily } from "recoil";

export default atomFamily<PaginationApi, string>({
  key: "paginationState",
  default: apiPath =>
    (async apiPath => {
      return await (await fetch(`/api/${apiPath}.json`)).json();
    })(apiPath),
});
