import { addExpense } from "../models/expenseModel.js";
import { v4 as uuidv4 } from "uuid";
import { fetchExpenses } from "../models/expenseModel.js";

export const createExpense = async (req, res) => {
  const { user_id, date, amount, category_id, subcategory_id, payment_method, note } = req.body;

  try {
    const expense_id = uuidv4();
    await addExpense({
      expense_id,
      user_id,
      date,
      amount,
      category_id,
      subcategory_id,
      payment_method,
      note,
    });
    res.status(201).json({ message: "Expense added", expense_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


export const getExpenses = async (req, res) => {
  const user_id = req.params.userId;

  if (!user_id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const expenses = await fetchExpenses(user_id);
    res.status(200).json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};