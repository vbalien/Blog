import React from "react";
import { usePage } from "./PageContext";

export const App: React.FC = () => {
  const page = usePage();
  return (
    <div>
      <article dangerouslySetInnerHTML={{ __html: page.content }}></article>
    </div>
  );
};
