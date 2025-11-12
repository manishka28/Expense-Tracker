import express from "express";
import { fetchCategories } from "../controllers/categoryController.js";
import { getCategoryOrSubcategoryInfo } from "../controllers/categoryController.js";
const router = express.Router();

// GET /api/categories/:userId
router.get("/subcategory-info", getCategoryOrSubcategoryInfo);
router.get("/:userId", fetchCategories);
// console.log("Category mein");


export default router;
