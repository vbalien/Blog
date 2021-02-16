export default function normalizePagename(pagename: string): string {
  if (pagename === "") pagename = "index.html";
  pagename = pagename.replace(/\/$/, "/index.html");
  return pagename;
}
