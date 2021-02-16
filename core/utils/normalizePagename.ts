export default function normalizePagename(pagename: string): string {
  if (pagename === "") pagename = "index.html";
  pagename = pagename.replace(/\/$/, "/index.html").replace(/\.html/, "");
  return pagename;
}
