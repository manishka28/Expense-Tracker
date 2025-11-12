import { db } from "../config/db.js";


export const createUser = async (name, email, phone, password_hash) => {
  const [result] = await db.query(
    "INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)",
    [name, email, phone, password_hash]
  );
  const [rows] = await db.query("SELECT user_id FROM users WHERE email = ?", [email]);
  return rows[0].user_id;
};

export const findUserByEmail = async (email) => {
  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0];
};
