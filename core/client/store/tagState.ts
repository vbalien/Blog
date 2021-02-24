import { TagsApi } from "core/writeApis";
import { atom } from "recoil";

export default atom<TagsApi>({
  key: "tagState",
  default: (async () => {
    try {
      return await (await fetch(`/api/tags.json`)).json();
    } catch (err) {
      return { tags: [] };
    }
  })(),
});
