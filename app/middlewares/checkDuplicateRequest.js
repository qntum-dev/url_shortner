import {getRedis} from "../db/redis.js";
import { closeConns } from "../utils/closeDbConns.js";
import { createRequestHash } from "../utils/createRequestHash.js";

//this middleware will check for duplicate requests within 40 seconds timeframe of the first request

export async function checkDuplicateRequest(req, res, next) {
  const hash = createRequestHash(req);
  const key = `req:${hash}`;
  let rdb;
  try {
    rdb = getRedis();
    console.log(key);

    const result = await rdb.set(key,"processing","EX",2,"NX");


    console.log(result);
    if (result === null) {
        console.log("Wait a second");
      await closeConns(rdb, null);

      return res.status(409).json({ error: "Duplicate request" });
    }

    console.log("new request");


    await closeConns(rdb, null);

    next();
  } catch (error) {
    console.error("Redis error:", error);
    await closeConns(rdb, null);
    next(error);
  }
}
