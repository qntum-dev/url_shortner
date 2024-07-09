import crypto from "crypto";

export function createRequestHash(req) {
  const { method, url, body } = req;

  return crypto
    .createHash("md5")
    .update(`${method}:${url}:${JSON.stringify(body)}`)
    .digest("hex");
}
