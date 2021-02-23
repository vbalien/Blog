import usePagename from "core/client/hooks/usePagename";
import React, { FC, useEffect } from "react";
import AsyncPage from "./AsyncPage";
import { Helmet } from "react-helmet";
import { useRecoilState } from "recoil";
import pageState from "./store/pageState";
import { PageMetadata } from "core/collectPages";
import { useLocation } from "react-router-dom";

const PageComponent: FC = () => {
  const location = useLocation();
  const pagename = usePagename();
  const [metadata, setMetadata] = useRecoilState(pageState);

  useEffect(() => {
    (async () => {
      const page = await import(`pages/${pagename}`);
      const title = (page.metadata as PageMetadata)?.title;
      setMetadata({ ...metadata, title: title || pagename });
    })();
  }, [pagename]);

  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
        <link
          data-rh="true"
          rel="canonical"
          href={process.env.BASE_URL + location.pathname}
        />
        <meta
          data-rh="true"
          name="description"
          content={metadata.description}
        />
        <meta
          data-rh="true"
          property="og:url"
          content={process.env.BASE_URL + location.pathname}
        />
        <meta data-rh="true" property="og:type" content="article" />
        <meta data-rh="true" property="og:title" content={metadata.title} />
        <meta
          data-rh="true"
          property="og:description"
          content={metadata.description}
        />
        {metadata.image && (
          <>
            <meta data-rh="true" property="og:image" content={metadata.image} />
            <meta
              data-rh="true"
              name="twitter:card"
              content="summary_large_image"
            />
          </>
        )}
        <meta data-rh="true" name="twitter:title" content={metadata.title} />
        <meta
          data-rh="true"
          name="twitter:description"
          content={metadata.description}
        />
        {metadata.image && (
          <meta data-rh="true" name="twitter:image" content={metadata.image} />
        )}
      </Helmet>
      <AsyncPage page={pagename} fallback={<div>Loading...</div>} />
    </>
  );
};

export default PageComponent;
