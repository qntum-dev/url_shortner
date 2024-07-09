import { configDotenv } from "dotenv";
// import { createClient } from "redis";
import { Redis } from "ioredis";
configDotenv();
//To connect to a different host or port, use a connection string in the format redis[s]://[[username][:password]@][host][:port][/db-number]:

let redisClient = null;
let cli;
// export async function getRedisClient() {
//   if (!redisClient || !redisClient.isOpen) {
//     redisClient = createClient({
//       url: `redis://${process.env.REDIS_USER}:@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
//       socket: {
//         reconnectStrategy: (retries) => {
//           if (retries > 10) {
//             console.log('Max reconnection attempts reached. Stopping reconnection.');
//             return new Error('Max reconnection attempts reached');
//           }
//           return Math.min(retries * 100, 3000); // Increase delay with each attempt
//         },
//         connectTimeout: 10000,
//       },
//     });

//     await redisClient.connect();

//     redisClient.on("connect", () => {
//       console.error("connected");
//       // client = null; // Reset the client on error
//     });

//     redisClient.on("error", (error) => {
//       console.error("Redis connection error:", error);
//       client = null; // Reset the client on error
//     });
//   }

//   return redisClient;
// }

export function getRedis() {
  const redis = new Redis(
    process.env.REDIS_PORT,
    process.env.REDIS_HOST,
    {
      retryStrategy(times) {
        console.log("number of times after connecting", times);
        if (times > 10) {
          console.log(
            "Max reconnection attempts reached. Stopping reconnection."
          );
          return new Error("Max reconnection attempts reached");
        }
        
        return Math.min(times * 100, 3000); // Increase delay with each attempt
      },
      enableReadyCheck:true,
      connectTimeout:10000
    }
    // process.env.REDIS_USER
  );

  redis.on("error", (err) => {
    console.log(err);
  });
  return redis;
}

export default cli;

// client.on('error', err => console.log('Redis Client Error', err));

// let rdb;
// try {

//    rdb=await client.connect();
// } catch (error) {
//   console.log(error);
//   // return;
// }

// const conn = await client.connect();

// console.log(conn);
// return conn

// await client.set("foo", "bar");

// const value = await client.get("foo");

// console.log("value is ", value);
// await client.disconnect();
