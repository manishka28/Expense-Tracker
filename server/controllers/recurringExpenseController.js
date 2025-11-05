import {
  getAllRecurringExpenses,
  updateNextDueDate,
  addRecurringExpense,
} from "../models/recurringExpenseModel.js";
import {db} from "../config/db.js";

// ✅ Utility function to calculate next due date
export const getNextDueDate = (date, frequency) => {
  const next = new Date(date);
  switch (frequency) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "yearly":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next.toISOString().split("T")[0];
};

// ✅ GET recurring expenses for a user
export const getRecurringExpenses = async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT * FROM recurring_expenses WHERE user_id = ?`,
      [userId]
    );
    res.status(200).json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching recurring expenses" });
  }
};

// ✅ POST - Add new recurring expense
export const createRecurringExpense = async (req, res) => {
  try {
    const data = req.body;
    await addRecurringExpense(data);
    res.status(200).json({ message: "Recurring expense added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding recurring expense" });
  }
};

// ✅ The cron logic (also exported so server.js can import)
export const processRecurringExpenses = async () => {
  const recurring = await getAllRecurringExpenses();
  const today = new Date().toISOString().split("T")[0];

  for (const r of recurring) {
    if (r.next_due_date && r.next_due_date <= today) {
      // Insert into main expenses table
      await db.query(
        `INSERT INTO expenses (user_id, category_id, amount, description, date)
         VALUES (?, ?, ?, ?, ?)`,
        [r.user_id, r.category_id, r.amount, r.name, today]
      );

      // Update next due date
      const newNext = getNextDueDate(r.next_due_date, r.frequency);
      await updateNextDueDate(r.recurring_id, newNext);

      console.log(`✅ Added recurring expense '${r.name}' for user ${r.user_id}`);
    }
  }
};


// POST /api/recurring-expenses/mark-paid/:id
export const markRecurringAsPaid = async (req, res) => {
  const { id } = req.params;

  try {
    // 1️⃣ Get recurring expense by ID
    const [recurringRows] = await db.query(
      "SELECT * FROM recurring_expenses WHERE recurring_id = ?",
      [id]
    );

    if (!recurringRows.length) {
      return res.status(404).json({
        success: false,
        message: "Recurring expense not found.",
      });
    }

    const recurring = recurringRows[0];

    // 2️⃣ Insert new record into `expenses` table
    await db.query(
      `INSERT INTO expenses (user_id, category_id, amount, note, date, payment_method)
       VALUES (?, ?, ?, ?, NOW(), ?)`,
      [
        recurring.user_id,
        recurring.category_id,
        recurring.amount,
        recurring.name,
        "auto", // since it's an automatic payment
      ]
    );

    // 3️⃣ Calculate next due date
    let nextDue = new Date(recurring.next_due_date || recurring.start_date);

    switch (recurring.frequency) {
      case "daily":
        nextDue.setDate(nextDue.getDate() + 1);
        break;
      case "weekly":
        nextDue.setDate(nextDue.getDate() + 7);
        break;
      case "monthly":
        nextDue.setMonth(nextDue.getMonth() + 1);
        break;
      case "yearly":
        nextDue.setFullYear(nextDue.getFullYear() + 1);
        break;
      default:
        break;
    }

    // 4️⃣ Update the next due date in recurring_expenses
    await db.query(
      "UPDATE recurring_expenses SET next_due_date = ? WHERE recurring_id = ?",
      [nextDue.toISOString().slice(0, 10), id] // convert to YYYY-MM-DD
    );

    res.status(200).json({
      success: true,
      message: "Recurring expense marked as paid and next due date updated.",
    });
  } catch (err) {
    console.error("Error marking recurring expense as paid:", err);
    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};
