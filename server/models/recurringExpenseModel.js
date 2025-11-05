import {db} from "../config/db.js";

// ✅ Get all recurring expenses
export const getAllRecurringExpenses = async () => {
  const [rows] = await db.query(`SELECT * FROM recurring_expenses`);
  return rows;
};

// ✅ Update next due date
export const updateNextDueDate = async (recurring_id, newDate) => {
  await db.query(
    `UPDATE recurring_expenses SET next_due_date = ? WHERE recurring_id = ?`,
    [newDate, recurring_id]
  );
};

// ✅ Add a new recurring expense (for manual addition)
export const addRecurringExpense = async (data) => {
  const { user_id, name, amount, category_id, start_date, frequency } = data;
  await db.query(
    `INSERT INTO recurring_expenses (user_id, name, amount, category_id, start_date, frequency, next_due_date)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [user_id, name, amount, category_id, start_date, frequency, start_date]
  );
};
