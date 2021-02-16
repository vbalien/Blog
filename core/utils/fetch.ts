import nodeFetch, { Request, Response } from "node-fetch";
import path from "path";
import fs from "fs";

export default new Proxy(nodeFetch, {
  apply: (target, _that, args) => {
    const [url, init] = args;
    const filePath = path.join(process.cwd(), "./dist", url.toString());
    if (/^https?:\/\//i.test(url.toString()) || !fs.existsSync(filePath))
      return target(url, init);

    return new Promise(resolve => {
      const request = new Request(url, init);
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
  },
});
