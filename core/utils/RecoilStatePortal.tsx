import React from "react";
import { RecoilValue, useRecoilSnapshot } from "recoil";

export let getRecoilState: <T>(
  recoilValue: RecoilValue<T>
) => Promise<T> = () => null;

export function RecoilStatePortal(): JSX.Element {
  getRecoilState = useRecoilSnapshot().getPromise;
  return <></>;
}
