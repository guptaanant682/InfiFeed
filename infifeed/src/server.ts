import app from "./app";
import dotenv from "dotenv";
import pool from "./config/db";

dotenv.config();

const PORT = process.env.PORT || 3000;

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    process.exit(1);
  } else {
    console.log("Database connection test successful:", res.rows[0]);
  }
});

app.listen(PORT, () => {
  console.log(\`Server is running on port \${PORT}\`);
});
