import express from "express";
import pool from "../db/postgres.js";

const viewurl = express.Router();

viewurl.get("/:code", async (req, res) => {
  let dbClient;
  const { code } = req.params;

  if (!code) {
    return res.status(404).send("Bad Request");
  }

  try {
    dbClient = await pool.connect();
    const { rows } = await dbClient.query(
      `SELECT * FROM "shortened_urls" WHERE short_code = $1;`,
      [code]
    );

    if (rows.length == 0) {
      dbClient.release();

      return res.status(404).json("Not found");
    }


    dbClient.release();

    return res.status(200).json(rows);
  } catch (error) {
    dbClient.release();
    
    console.log(error);
    return res.status(500).send("Internal Server error");
  }
});

export default viewurl;
