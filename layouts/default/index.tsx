import { pageState } from "core/store/pageState";
import React, { FC } from "react";
import { useRecoilValueLoadable } from "recoil";

const DefaultLayout: FC = () => {
  const pageLoadable = useRecoilValueLoadable(pageState("index"));
  switch (pageLoadable.state) {
    case "hasValue":
      return (
        <div
          dangerouslySetInnerHTML={{ __html: pageLoadable.contents.content }}
        />
      );
    case "loading":
      return <div>Loading...</div>;
    case "hasError":
      throw pageLoadable.contents;
  }
};
export default DefaultLayout;

export const states = {
  pageState: pageState("index"),
};
