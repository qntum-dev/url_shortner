import express from "express";
import "dotenv/config";
import pool from "./db/postgres.js";

import { UAParser } from "ua-parser-js";
import shorten from "./routes/shortcode.js";
import analytics from "./routes/analytics.js";
import viewurl from "./routes/viewurl.js";
import del from "./routes/delete.js";
import { checkDuplicateRequest } from "./middlewares/checkDuplicateRequest.js";
import { closeConns } from "./utils/closeDbConns.js";
import { getRedis } from "./db/redis.js";

const app = express();

const PORT = process.env.PORT;
const CACHE_TTL = process.env.CACHE_TTL;
// const ANALYTICS_FLUSH_INTERVAL = process.env.ANALYTICS_FLUSH_INTERVAL || 120000; // Flush analytics to DB every 60 seconds

const ANALYTICS_FLUSH_INTERVAL =  process.env.ANALYTICS_FLUSH_INTERVAL;

console.log(process.env.ANALYTICS_FLUSH_INTERVAL);

app.use(express.json());


// app.get("/heal",async (req,res)=>{
//   res.status(200).json({
//     "Health":true
//   })
// })
function isPC(userAgent) {
  const desktop_keywords = [
    "Windows",
    "Macintosh",
    "Mac",
    "x64",
    "x86_64",
    "X11",
    "CrOS",
    "Ubuntu",
    "Linux",
  ];

  return desktop_keywords.some((keyword) => userAgent.includes(keyword));
}
app.get("/:shortcode", async (req, res) => {
  const { shortcode } = req.params;
  const userAgent = req.headers["user-agent"];
  const ipAddress = req.headers["x-forwarded-for"] || req.ip;
  const parsedUA = UAParser(userAgent);
  let device = parsedUA.device.type || "rest-client";
  if (device === "rest-client" && isPC(userAgent)) {
    device = "pc";
  }

  if (!shortcode) {
    return res.status(400).send("Error: short code required");
  }

  let rdb, dbClient;
  try {
    rdb = getRedis();
    console.log(rdb.status);

    // const pyshed=await rdb.lpush("List_1",1890538095803);
    // console.log(pyshed);

    const cachedUrl = await rdb.get(`url:${shortcode}`);

    if (cachedUrl) {
      await updateClickInfoRedis(rdb, shortcode, ipAddress, userAgent, device);
      return res.redirect(cachedUrl);
    }

    dbClient = await pool.connect();
    const { rows } = await dbClient.query(
      `SELECT destination FROM "shortened_urls" WHERE short_code = $1;`,
      [shortcode]
    );

    if (rows.length === 0) {
      return res.status(404).send("URL doesn't exist");
    }

    const originalUrl = rows[0].destination;
    await rdb.set(`url:${shortcode}`, originalUrl, "EX", CACHE_TTL);
    await updateClickInfoRedis(rdb, shortcode, ipAddress, userAgent, device);
    await closeConns(rdb, dbClient);

    return res.redirect(originalUrl);
  } catch (error) {
    console.error("Error processing request:", error);
    await closeConns(rdb, dbClient);
    return res.status(500).send("Internal Server error");
  }
});

async function updateClickInfoRedis(
  rdb,
  shortcode,
  ipAddress,
  userAgent,
  device
) {
  console.log(rdb.status);

  const clickData = JSON.stringify({
    ipAddress,
    userAgent,
    device,
    timestamp: Date.now(),
  });

  await rdb.rpush(`clicks:${shortcode}`, clickData);
  await rdb.incr(`clickcount:${shortcode}`);
}

let isFlushingAnalytics = false;

async function flushAnalyticsToDB() {
  if (isFlushingAnalytics) {
    console.log(
      "Previous flush operation still running. Skipping this iteration."
    );
    return;
  }

  isFlushingAnalytics = true;
  const startTime = new Date();
  console.log(`[${startTime.toISOString()}] Analytics flush job starting...`);

  let dbClient, rdb;

  try {
    rdb = getRedis();
   
    const resp = await rdb.get("foo");
    console.log(resp);

    dbClient = await pool.connect();

    await dbClient.query("BEGIN");

    // console.log(rdb);

    const shortcodes = await rdb.keys("clicks:*");
    console.log(`Processing ${shortcodes.length} shortcodes...`);

    for (const key of shortcodes) {
      const shortcode = key.split(":")[1];
      const [clicks, clickCount] = await Promise.all([
        rdb.lrange(key, 0, -1),
        rdb.get(`clickcount:${shortcode}`),
      ]);

      if (clicks.length > 0) {
        const values = clicks
          .map(JSON.parse)
          .map(
            ({ ipAddress, userAgent, device, timestamp }) =>
              `('${shortcode}', '${ipAddress}', '${userAgent}', '${device}', to_timestamp(${
                timestamp / 1000
              }))`
          )
          .join(",");

        await dbClient.query(`
          INSERT INTO "clicks" (shortened_url_code, ip_address, user_agent, device, clicked_at)
          VALUES ${values}
        `);
      }

      if (clickCount) {
        await dbClient.query(
          `
          UPDATE "shortened_urls" 
          SET click_count = click_count + $1 
          WHERE short_code = $2
        `,
          [clickCount, shortcode]
        );
      }
    }

    await dbClient.query("COMMIT");
    console.log("Database commit successful. Cleaning up Redis...");

    await Promise.all(
      shortcodes.map((key) =>
        Promise.all([rdb.del(key), rdb.del(`clickcount:${key.split(":")[1]}`)])
      )
    );

    await closeConns(rdb, dbClient);
    isFlushingAnalytics = false;

    console.log("Redis cleanup complete.");
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;
    console.log(
      `[${endTime.toISOString()}] Analytics flush job completed. Duration: ${duration} seconds`
    );
  } catch (error) {
    if (dbClient) await dbClient.query("ROLLBACK");

    isFlushingAnalytics = false;
   
    await closeConns(rdb, dbClient);

    console.log("last log");
    console.error("Error flushing analytics to DB:", error);
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;
    console.log(
      `[${endTime.toISOString()}] Analytics flush job completed. Duration: ${duration} seconds`
    );
  }
}

setInterval(flushAnalyticsToDB, ANALYTICS_FLUSH_INTERVAL);

// async function updateClickInfo(shortcode, ipAddress, userAgent, device) {
//   let dbClient;
//   try {
//     dbClient = await pool.connect();
//     await dbClient.query("BEGIN");

//     await dbClient.query(
//       `INSERT INTO "clicks" (shortened_url_code, ip_address, user_agent, device) VALUES ($1, $2, $3, $4);`,
//       [shortcode, ipAddress, userAgent, device]
//     );

//     await dbClient.query(
//       `UPDATE "shortened_urls" SET click_count = click_count + 1 WHERE short_code = $1;`,
//       [shortcode]
//     );

//     await dbClient.query("COMMIT");
//   } catch (error) {
//     await dbClient.query("ROLLBACK");
//     // await closeConns(dbClient);
//     throw new Error("Internal Server error");
//   }
// }

app.use("/", checkDuplicateRequest);

app.use("/shorten", shorten);

app.use("/analytics", analytics);

app.use("/viewurl", viewurl);

app.use("/del", del);



app.listen(PORT, () => {
  console.log(`Server is listening at ${PORT}`);
});
