import AsyncPage from "core/client/AsyncPage";
import usePagename from "core/utils/usePagename";
import React, { FC } from "react";
import { Link } from "react-router-dom";

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
  return <AsyncPage page={pagename} />;
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

export const states = {};
