import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

// Create a new pool instance
const pool = new Pool();

pool.on("error",(err)=>{
    console.log('Unexpected error on the postgrest client',err);
})

export default pool;
