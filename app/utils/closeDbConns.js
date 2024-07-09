export async function closeConns(rdb,dbClient){
    if (rdb && rdb.isReady) {
        // console.log("Rdb is open ",rdb.isOpen);
        await rdb.quit();
        console.log("Rdb connection is closed successfully");

      }
      if(dbClient){

          dbClient.release();
      }
    //   console.log("Disconnecting postgres");
    //   return res.status(409).send("duplicate request")

}

// export async handleRequests()