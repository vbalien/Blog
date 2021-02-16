import usePagename from "core/utils/usePagename";
import React, { FC } from "react";
import AsyncPage from "./AsyncPage";

const PageComponent: FC = () => {
  const pagename = usePagename().replace(
    /(.*\/)page\/[^\\/]*(?:\d+|index)?$/,
    "$1_paginator"
  );
  return <AsyncPage page={pagename} fallback={<div>Loading...</div>} />;
};

export default PageComponent;
