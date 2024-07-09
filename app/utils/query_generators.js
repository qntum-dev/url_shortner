import pool from "../db/postgres.js";

async function selectAllExcept(table, excludeColumns, conditionColumn) {
    const client=await pool.connect();
  
    // Get all columns except the one to exclude
    const columnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = $1 AND column_name != ALL($2::text[]);
    `;
  
      
    const columnRes = await client.query(columnQuery, [table, excludeColumns]);
  
    // console.log(columnRes);
  
    const columns = columnRes.rows.map(row => row.column_name).join(', ');
  
    // console.log(columns);
  
    // Construct the SELECT query
    const selectQuery = `SELECT ${columns} FROM "${table}" WHERE ${conditionColumn} = $1;`;
    
    client.release();
    return selectQuery
  }

  export {selectAllExcept};