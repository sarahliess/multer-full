const { Pool } = require("pg");

const connectionString = process.env.PG_CONNECTIONSTRING;

const pool = new Pool({
  connectionString,
});

console.log("db", process.env.PG_CONNECTIONSTRING);

module.exports = pool;
