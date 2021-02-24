import usePagename from "core/client/hooks/usePagename";
import React, { FC } from "react";
import AsyncPage from "./AsyncPage";
import Head from "./Head";

const PageComponent: FC = () => {
  const pagename = usePagename();
  return (
    <>
      <Head pagename={pagename} />
      <AsyncPage pagename={pagename} fallback={<div>Loading...</div>} />
    </>
  );
};

export default PageComponent;
