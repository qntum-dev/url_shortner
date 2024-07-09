import express from "express";
import pool from "../db/postgres.js";
import {getRedis} from "../db/redis.js";
import { closeConns } from "../utils/closeDbConns.js";

const del = express.Router();

del.delete("/:shortcode", async (req, res) => {
  const { shortcode } = req.params;
  let dbClient, rdb;

  if (!shortcode) {
    return res.status(400).send("Bad Request");
  }

  try {
    dbClient = await pool.connect();
    rdb = getRedis();

    const isShortcode = await rdb.get(`${shortcode.toString()}`);

    //checking if the short code exists in the cache
    if (!isShortcode) {
      console.log("Not found in cache");

      const isShortcode = await dbClient.query(
        `SELECT EXISTS(SELECT 1 FROM "shortened_urls" WHERE short_code = $1);`,
        [shortcode]
      );

      console.log(isShortcode.rows[0].exists);

      if (!isShortcode.rows[0].exists) {
        return res.status(404).send("Url does not exist!!!");
      }
    }

    console.log(
      "Short code found in cache",
      await rdb.get(`${shortcode.toString()}`)
    );

    await rdb.del(`${shortcode.toString()}`);

    await dbClient.query("BEGIN");

    await dbClient.query(
      `DELETE FROM "clicks" WHERE shortened_url_code = $1;`,
      [shortcode]
    );

    await dbClient.query(
      `DELETE FROM "shortened_urls" WHERE short_code = $1;`,
      [shortcode]
    );

    await dbClient.query("COMMIT");
    await closeConns(rdb, dbClient);

    return res.status(204).send("Url deleted");

    
  } catch (error) {


    console.log(error);
    await dbClient.query("ROLLBACK");

    await closeConns(rdb, dbClient);
    return res.status(500).send("Internal Server error");


  }
});

export default del;
