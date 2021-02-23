import { PageMetadata } from "core/collectPages";
import { atom } from "recoil";

export default atom<PageMetadata>({
  key: "pageState",
  default: {},
});
