import usePagename from "core/client/hooks/usePagename";
import React, { FC } from "react";
import AsyncPage from "./AsyncPage";

const PageComponent: FC = () => {
  const pagename = usePagename();
  return <AsyncPage page={pagename} fallback={<div>Loading...</div>} />;
};

export default PageComponent;
