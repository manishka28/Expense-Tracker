import express from "express";
import { getExpenseAnalytics } from "../controllers/expenseAnalyticsController.js";

const router = express.Router();

// Unified API for analytics
router.get("/expense-analytics/:userId", getExpenseAnalytics);

export default router;
