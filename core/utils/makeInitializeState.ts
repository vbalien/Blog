import { PageMetadata } from "core/collectPages";
import { MutableSnapshot, RecoilState } from "recoil";

type PageMetadataOption = {
  pageMetadata: PageMetadata;
  pageState: RecoilState<PageMetadata>;
};

export default function makeInitializeState(
  preloadStates: RecoilState<unknown>[],
  preloadedState: PreloadedState,
  { pageMetadata, pageState }: PageMetadataOption
): (snapshot: MutableSnapshot) => void {
  return ({ set }) => {
    set(pageState, pageMetadata ?? {});
    for (const [key, value] of preloadedState) {
      const layoutState = preloadStates.find(s => s.key === key);
      layoutState && set(layoutState, value);
    }
  };
}
