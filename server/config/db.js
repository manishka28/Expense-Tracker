import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const db = await mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // optional: limits number of connections in pool
  queueLimit: 0,
});

try {
  const [rows] = await db.query("SELECT 1");
  console.log("✅ MySQL Connected Successfully!");
} catch (err) {
  console.error("❌ MySQL Connection Failed:", err.message);
}

export { db };
