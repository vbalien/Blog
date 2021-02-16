import paginationState from "core/store/paginationState";
import React, { FC } from "react";
import { Link } from "react-router-dom";
import { useRecoilValueLoadable } from "recoil";

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

const TestStateShow = ({ loadable }) => {
  switch (loadable.state) {
    case "hasValue":
      return <pre>{JSON.stringify(loadable.contents)}</pre>;
    case "loading":
      return <div>Loading...</div>;
    case "hasError":
      throw loadable.contents;
  }
};

const DefaultLayout: Layout = ({ children }) => {
  const testValueLoadable = useRecoilValueLoadable(
    paginationState("articles/page/2")
  );
  return (
    <>
      <NavBar />
      {children}

      <TestStateShow loadable={testValueLoadable} />
    </>
  );
};
DefaultLayout.states = {
  paginationStateTest: paginationState("articles/page/2"),
};

export default DefaultLayout;
