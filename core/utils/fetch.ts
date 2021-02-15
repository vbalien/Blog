import nodeFetch, {
  RequestInfo,
  RequestInit,
  Request,
  Response,
} from "node-fetch";
import path from "path";
import fs from "fs";

export default async function fetch(
  url: RequestInfo,
  init?: RequestInit
): Promise<Response> {
  const request = new Request(url, init);

  return new Promise(resolve => {
    const filePath = path.join(process.cwd(), "./dist", url.toString());
    if (/^https?:\/\//i.test(url.toString()) || !fs.existsSync(filePath)) {
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
