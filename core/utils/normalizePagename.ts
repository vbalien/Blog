export default function normalizePagename(
  pagename: string,
  options: { ignorePaginator: boolean } = { ignorePaginator: false }
): string {
  pagename = pagename
    .replace(/^\//, "")
    .replace(/\/$/, "/index.html")
    .replace(/\.html$/, "");
  if (!options.ignorePaginator)
    pagename = pagename
      .replace(/(.*\/)page\/[^\\/]*(?:\d+|index)?$/, "$1_paginator")
      .replace(/(^tags\/)[^\\/]*\/(_paginator$)/, "$1$2");
  if (pagename === "") pagename = "index";
  return pagename;
}
