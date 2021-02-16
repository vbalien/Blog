export default function normalizePagename(pagename: string): string {
  pagename = pagename
    .replace(/^\//, "")
    .replace(/\/$/, "/index.html")
    .replace(/\.html$/, "");
  if (pagename === "") pagename = "index";
  return pagename;
}
