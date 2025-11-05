// controllers/dashboardController.js
import {db} from "../config/db.js";

export const getDashboardData = async (req, res) => {
  const { userId } = req.params;

  try {
    // Total income & expense
    const [incomeRow] = await db.query(
      "SELECT IFNULL(SUM(amount), 0) AS totalIncome FROM income WHERE user_id = ?",
      [userId]
    );
    const [expenseRow] = await db.query(
      "SELECT IFNULL(SUM(amount), 0) AS totalExpense FROM expenses WHERE user_id = ?",
      [userId]
    );

    const totalIncome = parseFloat(incomeRow[0].totalIncome) || 0;
    const totalExpense = parseFloat(expenseRow[0].totalExpense) || 0;
    const netSavings = totalIncome - totalExpense;

    // Monthly income vs expense (last 6 months)
    const [monthly] = await db.query(
      `
      SELECT 
        DATE_FORMAT(date, '%b') AS month,
        SUM(CASE WHEN type='income' THEN amount ELSE 0 END) AS income,
        SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS expense
      FROM (
        SELECT date, amount, 'income' AS type FROM income WHERE user_id = ?
        UNION ALL
        SELECT date, amount, 'expense' AS type FROM expenses WHERE user_id = ?
      ) AS all_txns
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY MONTH(date)
      ORDER BY MIN(date)
      `,
      [userId, userId]
    );

    const monthlyData = monthly.map((m) => ({
      month: m.month,
      income: Number(m.income),
      expense: Number(m.expense),
    }));

    // Expense breakdown by category
    const [categoryExpenses] = await db.query(
      `
      SELECT c.name, SUM(e.amount) AS value
      FROM expenses e
      LEFT JOIN categories c ON e.category_id = c.category_id
      WHERE e.user_id = ?
      GROUP BY c.name
      `,
      [userId]
    );

    const pieData = categoryExpenses.map((item) => ({
      name: item.name || "Uncategorized",
      value: Number(item.value),
    }));

    // Goals
    const [userGoals] = await db.query(
      `
      SELECT name, 
        ROUND((current_amount / target_amount) * 100, 0) AS progress
      FROM goals
      WHERE user_id = ?
      `,
      [userId]
    );

    const goals = userGoals.map((g) => ({
      name: g.name,
      progress: Number(g.progress),
    }));


    // Recent Transactions (latest 5 from income and expenses)
const [recentTransactions] = await db.query(
  `
  SELECT id, user_id, type, amount, note, date, created_at, category
  FROM (
    SELECT 
      e.expense_id AS id,
      e.user_id,
      'Expense' AS type,
      e.amount,
      e.note,
      e.date,
      e.created_at,
      c.name AS category
    FROM expenses e
    LEFT JOIN categories c ON e.category_id = c.category_id
    WHERE e.user_id = ?

    UNION ALL

    SELECT 
      i.income_id AS id,
      i.user_id,
      'Income' AS type,
      i.amount,
      i.note,
      i.date,
      i.created_at,
      i.source AS category
    FROM income i
    WHERE i.user_id = ?
  ) AS all_txns
  ORDER BY created_at DESC
  LIMIT 5
  `,
  [userId, userId]
);

    res.json({
      totalIncome,
      totalExpense,
      netSavings,
      monthlyData,
      pieData,
      goals,
      recentTransactions,
    });
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
