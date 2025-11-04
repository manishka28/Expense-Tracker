import { db } from "../config/db.js";

export const addExpense = async ({
  expense_id,
  user_id,
  date,
  amount,
  category_id,
  subcategory_id,
  payment_method,
  note,
}) => {
  const query =
    "INSERT INTO expenses (expense_id, user_id, date, amount, category_id, subcategory_id, payment_method, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  await db.query(query, [
    expense_id,
    user_id,
    date,
    amount,
    category_id || null,
    subcategory_id || null,
    payment_method || null,
    note || null,
  ]);
};
export const fetchExpenses = async (user_id) => {
  const query = `
    SELECT e.expense_id, e.date, e.amount, e.payment_method, e.note,
           c.name AS category_name,
           s.name AS subcategory_name
    FROM expenses e
    LEFT JOIN categories c ON e.category_id = c.category_id
    LEFT JOIN subcategories s ON e.subcategory_id = s.subcategory_id
    WHERE e.user_id = ?
    ORDER BY e.date DESC
  `;
  const [rows] = await db.query(query, [user_id]);
  return rows;
};
