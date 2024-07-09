import express from "express";
import generate_code from "../utils/getShortCode.js";
import pool from "../db/postgres.js";
import {getRedis} from "../db/redis.js";
import { closeConns } from "../utils/closeDbConns.js";

const shorten = express.Router();


import { hostname  } from 'os';

const host = hostname();
// console.log(`Hostname: ${host}`);

shorten.post("/", async (req, res) => {
  const { url } = req.body;
  let dbClient,rdb;

  if (!url) {
    return res.status(400).send("Error Destination Url required");
  }
  const code = generate_code();
  if (!code) {
    return res.status(500).send("Couldn't generate the url");
  }

  try {

    dbClient = await pool.connect();
    rdb = getRedis();

    const result = await dbClient.query(
      `INSERT INTO "shortened_urls" (destination, short_code) VALUES ($1, $2) RETURNING short_code;`,
      [url, code]
    );

    await rdb.set(`${code.toString()}`, result.rows[0].short_code);
    await closeConns(rdb,dbClient);


    // if()
    return res.status(200).send({
      short_code: result.rows[0].short_code
    });
  } catch (error) {
    
    console.log(error);
    await closeConns(rdb,dbClient);
    
    if (error.code == "23505" && error.constraint == "unique_destination") {
      return res.status(400).send("Shortened url already exists");
    }
    console.log(error);
    return res.status(500).send("Internal Server error");
  }
});

shorten.post("/update_dest/:shortcode", async (req, res) => {
  const { shortcode } = req.params;

  const { newurl } = req.body;

  let dbClient, rdb;

  try {
    rdb = getRedis();
    dbClient = await pool.connect();

    //checking for bad requests
    if (!shortcode || !newurl) {
      await closeConns(rdb,dbClient);
      return res.status(400).send("Bad Request");
    }

    // getting the previous reqbody for this shortcode for the checking of duplicate request
    let validator = JSON.parse(await rdb.get(`req_body:${shortcode.toString()}`));

    //checking if it is null if it is then fetch from th main db
    if (!validator) {
      validator = await dbClient.query(
        `SELECT destination FROM "shortened_urls" WHERE short_code = $1;`,
        [shortcode]
      );

      // console.log(validator);

      //checking if the rows returned from the db is empty
      if (validator.rows.length < 1) {
        await closeConns(rdb, dbClient);
        return res.status(404).send("Not found");
      }

      validator = validator.rows[0];
      console.log(validator);
    }

    //checking if it is a duplicate request or not
    if (
      newurl == validator.destination
    ) {
      console.log("duplicate request");
      await closeConns(rdb, dbClient);
      return res.status(409).send("duplicate request");
    }

    const isShortcode=await rdb.get(`${shortcode.toString()}`);

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
      await rdb.set(`${shortcode.toString()}`, shortcode);


    }

    console.log("Short code found in cache",await rdb.get("short_code"));

    // If shortcode is valid, update the URL
    const result = await dbClient.query(
      `UPDATE "shortened_urls" SET prev_destination = destination, destination = $1 WHERE short_code = $2 RETURNING prev_destination, destination;`,
      [newurl, shortcode]
    );

    await rdb.set(`req_body:${shortcode.toString()}`,JSON.stringify(result.rows[0]));


    await closeConns(rdb, dbClient);

    res.status(200).json({
      updated: "true",
    });
  } catch (error) {
    console.log(error);

    await closeConns(rdb, dbClient);

    return res.status(500).send("Internal Server error");
  }
});



export default shorten;
