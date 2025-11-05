import {db} from "../config/db.js";

export const getExpenseAnalytics = async (req, res) => {
  const { userId } = req.params;

  try {
    // 1️⃣ Get expenses grouped by category
    const [categoryTotals] = await db.query(
      `
      SELECT 
        c.name AS category_name,
        SUM(e.amount) AS total_amount
      FROM expenses e
      JOIN categories c ON e.category_id = c.category_id
      WHERE e.user_id = ?
      GROUP BY c.category_id, c.name
      ORDER BY total_amount DESC;
      `,
      [userId]
    );

    // 2️⃣ Identify top category (if available)
    const topCategory = categoryTotals.length > 0 ? categoryTotals[0] : null;

    // 3️⃣ Optionally: total overall expense
    const totalExpense = categoryTotals.reduce(
      (sum, c) => sum + Number(c.total_amount),
      0
    );

    // 4️⃣ Combine everything in one response
    res.json({
      success: true,
      data: {
        categoryTotals,  // For Pie Chart
        topCategory,     // For summary section
        totalExpense,    // For showing total
      },
    });
  } catch (error) {
    console.error("❌ Error fetching expense analytics:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};





