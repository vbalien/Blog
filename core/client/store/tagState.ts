import { TagsApi } from "core/writeApis";
import { atom } from "recoil";

export default atom<TagsApi>({
  key: "tagState",
  default: (async () => await (await fetch(`/api/tags.json`)).json())(),
});
