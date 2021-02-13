import React, { useContext } from "react";
import { PageMetadata } from "./getPages";

export interface PageContextValue extends PageMetadata {
  content: string;
}

const PageContext = React.createContext<PageContextValue>(null);

export function usePage(): PageContextValue {
  return useContext(PageContext);
}

export default PageContext;
