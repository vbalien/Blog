import React from "react";
import { usePage } from "./PageContext";

type AppProps = {};
export const App: React.FC<AppProps> = (props) => {
  const page = usePage();
  return (
    <div>
      <article dangerouslySetInnerHTML={{ __html: page.content }}></article>
    </div>
  );
};
