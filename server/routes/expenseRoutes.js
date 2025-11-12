import express from "express";
import { createExpense, getExpenses,deleteExpense } from "../controllers/expenseController.js";

const router = express.Router();

// POST /api/expenses
router.post("/", createExpense);
router.get("/:userId", getExpenses);
router.delete("/:expenseId", deleteExpense);


export default router;
