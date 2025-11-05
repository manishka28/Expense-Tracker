import * as IncomeModel from "../models/incomeModel.js";

// ✅ Fetch all incomes
export const getIncome = async (req, res) => {
  try {
    const { userId } = req.params;
    const incomes = await IncomeModel.getIncomeByUser(userId);

    if (!incomes || incomes.length === 0) {
      return res.status(200).json({
        message: "No income records found.",
        data: [],
      });
    }

    res.status(200).json({
      message: "Income records fetched successfully.",
      data: incomes,
    });
  } catch (error) {
    console.error("❌ Error fetching incomes:", error);
    res.status(500).json({ message: "Failed to fetch income records." });
  }
};

// ✅ Add new income
export const addIncome = async (req, res) => {
  try {
    const { user_id, date, amount, source, note } = req.body;
    if (!user_id || !date || !amount) {
      return res.status(400).json({ message: "Required fields are missing." });
    }

    await IncomeModel.addIncome(user_id, date, amount, source, note);
    res.json({ message: "Income added successfully." });
  } catch (error) {
    console.error("❌ Error adding income:", error);
    res.status(500).json({ message: "Failed to add income." });
  }
};

// ✅ Delete income
export const deleteIncome = async (req, res) => {
  try {
    const { userId, incomeId } = req.params;
    const deleted = await IncomeModel.deleteIncome(incomeId, userId);

    if (deleted) {
      res.json({ message: "Income deleted successfully." });
    } else {
      res.status(404).json({ message: "Income not found." });
    }
  } catch (error) {
    console.error("❌ Error deleting income:", error);
    res.status(500).json({ message: "Failed to delete income." });
  }
};

// ✅ Update income
export const updateIncome = async (req, res) => {
  try {
    const { userId, incomeId } = req.params;
    const updated = await IncomeModel.updateIncome(incomeId, userId, req.body);

    if (updated) {
      res.json({ message: "Income updated successfully." });
    } else {
      res.status(404).json({ message: "Income not found or no changes made." });
    }
  } catch (error) {
    console.error("❌ Error updating income:", error);
    res.status(500).json({ message: "Failed to update income." });
  }
};
