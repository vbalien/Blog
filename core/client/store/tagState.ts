import { TagsApi } from "core/writeApis";
import { atomFamily } from "recoil";

export default atomFamily<TagsApi, null>({
  key: "tagState",
  default: () => (async () => await (await fetch(`/api/tags.json`)).json())(),
});
