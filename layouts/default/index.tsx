import React, { FC } from "react";
import { Link } from "react-router-dom";

const NavBar: FC = () => {
  return (
    <>
      <h2>Nav</h2>

      <ul>
        <li>
          <Link to="/articles/page/">articles</Link>
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

const DefaultLayout: FC = ({ children }) => {
  return (
    <>
      <NavBar />
      {children}
    </>
  );
};
export default DefaultLayout;

export const states = {};
