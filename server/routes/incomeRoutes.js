import express from "express";
import {
  getIncome,
  addIncome,
  deleteIncome,
  updateIncome,
} from "../controllers/incomeController.js";

const router = express.Router();

// GET all income records for a user
router.get("/:userId", getIncome);

// POST add new income
router.post("/", addIncome);

// DELETE income by id
router.delete("/:userId/:incomeId", deleteIncome);

// PUT update income
router.put("/:userId/:incomeId", updateIncome);

export default router;
