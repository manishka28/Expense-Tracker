import express from "express";
import { createExpense, getExpenses } from "../controllers/expenseController.js";

const router = express.Router();

// POST /api/expenses
router.post("/", createExpense);
router.get("/:userId", getExpenses);


export default router;
