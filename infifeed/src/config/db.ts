import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Production considerations for Pool settings:
  // max: number of clients in the pool (e.g., 10-20, depends on DB capacity and app load)
  // idleTimeoutMillis: milliseconds a client can remain idle before being closed (e.g., 10000)
  // connectionTimeoutMillis: milliseconds to wait for a connection from the pool (e.g., 0 or a few seconds)
  // These settings can be configured here or through environment variables for flexibility.
});

pool.on("connect", () => {
  console.log("Connected to the database");
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

export default pool;
