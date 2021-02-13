export default function fetch(
  url: RequestInfo,
  init?: RequestInit
): Promise<Response> {
  if (
    !!(
      typeof window !== "undefined" &&
      window.document &&
      window.document.createElement
    )
  ) {
    return window.fetch(url, init);
  } else {
    const fs = require("fs");
    const path = require("path");
    const nodeFetch = require("node-fetch");
    const Request = nodeFetch.Request;
    const Response = nodeFetch.Response;
    const request = new Request(url, init);

    return new Promise((resolve, reject) => {
      const filePath = path.resolve(process.cwd(), "./dist", url);
      if (url[0] !== "." || !fs.existsSync(filePath)) {
        return nodeFetch(url, init);
      }
      const readStream = fs.createReadStream(filePath);
      readStream.on("open", function () {
        resolve(
          new Response(readStream, {
            url: request.url,
            status: 200,
            statusText: "OK",
            size: fs.statSync(filePath).size,
            timeout: request.timeout,
          })
        );
      });
    });
  }
}
