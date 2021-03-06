import AsyncPage from "core/client/AsyncPage";
import usePaginationLoadable from "core/client/hooks/usePaginationLoadable";
import normalizePagename from "core/utils/normalizePagename";
import React from "react";
import { Link } from "react-router-dom";

export const metadata = {
  title: "Paginator",
};

export const Page = (): JSX.Element => {
  const pageLoadable = usePaginationLoadable();
  switch (pageLoadable.state) {
    case "hasValue":
      return (
        <ul>
          {pageLoadable.contents.posts.map(post => {
            return (
              <li key={post.path}>
                <Link
                  to={post.path}
                  onMouseOver={() =>
                    AsyncPage.preload({
                      pagename: normalizePagename(post.path),
                    })
                  }
                >
                  {post.path}
                </Link>
              </li>
            );
          })}
        </ul>
      );
    case "loading":
      return <div>Loading...</div>;
    case "hasError":
      throw pageLoadable.contents;
  }
};

export default function Paginator(): JSX.Element {
  return (
    <>
      <h1>Paginator</h1>
      <Page />
    </>
  );
}
