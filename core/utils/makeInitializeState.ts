import { MutableSnapshot, RecoilState } from "recoil";

export default function makeInitializeState(
  preloadStates: RecoilState<unknown>[],
  preloadedState: PreloadedState
): (snapshot: MutableSnapshot) => void {
  return ({ set }) => {
    for (const [key, value] of preloadedState) {
      const layoutState = preloadStates.find(s => s.key === key);
      layoutState && set(layoutState, value);
    }
  };
}
