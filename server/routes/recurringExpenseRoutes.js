import express from "express";
import {
  getRecurringExpenses,
  createRecurringExpense,
  markRecurringAsPaid
} from "../controllers/recurringExpenseController.js";

const router = express.Router();

router.get("/:userId", getRecurringExpenses);
router.post("/", createRecurringExpense);
router.post("/mark-paid/:id", markRecurringAsPaid);
export default router;
