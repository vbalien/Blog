import { pageState } from "core/store/pageState";
import usePagename from "core/utils/usePagename";
import React, { FC } from "react";
import { Link } from "react-router-dom";
import { useRecoilValueLoadable } from "recoil";

const NavBar: FC = () => {
  return (
    <>
      <h2>Nav</h2>

      <ul>
        <li>
          <Link to="/a/">a</Link>
        </li>
        <li>
          <Link to="/a/b.html">a/b</Link>
        </li>
        <li>
          <Link to="/">/</Link>
        </li>
      </ul>
    </>
  );
};

const Article: FC = () => {
  const pagename = usePagename();
  const pageLoadable = useRecoilValueLoadable(pageState(pagename));

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

const DefaultLayout: FC = () => {
  return (
    <>
      <NavBar />
      <Article />
    </>
  );
};
export default DefaultLayout;

export const states = (pagename: string) => {
  return {
    pageState: pageState(pagename),
  };
};
