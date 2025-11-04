import express from "express";
import { fetchCategories } from "../controllers/categoryController.js";

const router = express.Router();

// GET /api/categories/:userId
router.get("/:userId", fetchCategories);

export default router;
