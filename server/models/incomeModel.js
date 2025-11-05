import { db } from "../config/db.js";

// ✅ Get all income entries for a user
export const getIncomeByUser = async (userId) => {
  const [rows] = await db.query(
    "SELECT * FROM income WHERE user_id = ? ORDER BY date DESC",
    [userId]
  );
  return rows;
};

// ✅ Add a new income record
export const addIncome = async (userId, date, amount, source, note) => {
  const [result] = await db.query(
    "INSERT INTO income (user_id, date, amount, source, note) VALUES (?, ?, ?, ?, ?)",
    [userId, date, amount, source, note]
  );
  return result.insertId;
};

// ✅ Delete income record by ID
export const deleteIncome = async (incomeId, userId) => {
  const [result] = await db.query(
    "DELETE FROM income WHERE income_id = ? AND user_id = ?",
    [incomeId, userId]
  );
  return result.affectedRows;
};

// ✅ (Optional) Update income record
export const updateIncome = async (incomeId, userId, data) => {
  const { date, amount, source, note } = data;
  const [result] = await db.query(
    "UPDATE income SET date = ?, amount = ?, source = ?, note = ? WHERE income_id = ? AND user_id = ?",
    [date, amount, source, note, incomeId, userId]
  );
  return result.affectedRows;
};
