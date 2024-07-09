import express from "express";
import pool from "../db/postgres.js";
import { selectAllExcept } from "../utils/query_generators.js";
import { closeConns } from "../utils/closeDbConns.js";
import {getRedis} from "../db/redis.js";


const analytics = express.Router();

analytics.get("/:shortcode", async (req, res) => {
  const { shortcode } = req.params;
  let dbClient, rdb;

  try {
    dbClient = await pool.connect();
    rdb = getRedis();

    const isShortcode = await rdb.get("short_code");

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

      await rdb.set("short_code", shortcode);
    }


    console.log("found in cache");

    const result_query = await selectAllExcept(
      "clicks",
      ["user_agent"],
      "shortened_url_code"
    );

    const { rows } = await dbClient.query(result_query, [shortcode]);
    
    await closeConns(rdb, dbClient);

    return res.status(200).json([...rows,{total_click_count:rows.length}]);
  
  
  } catch (error) {
    await closeConns(rdb, dbClient);
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
});

export default analytics;
