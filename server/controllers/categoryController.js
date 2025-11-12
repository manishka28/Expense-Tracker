import { getCategoriesByUser } from "../models/categoryModel.js";
import { db } from "../config/db.js";
export const fetchCategories = async (req, res) => {
  const { userId } = req.params;
  try {
    
    const categories = await getCategoriesByUser(userId);
    // console.log("categories",categories);
    
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
export const getCategoryOrSubcategoryInfo = async (req, res) => {
  const { name } = req.query;
  // console.log("name",name);
  
  if (!name) return res.status(400).json({ error: "Missing name" });

  try {
    const nameTrimmed = name.trim().toLowerCase();
    // console.log("nameTr",nameTrimmed);
    
    // 🔹 First, try to find a matching subcategory
    const [subRows] = await db.query(
      `SELECT s.subcategory_id, s.name AS subcategory_name, c.category_id, c.name AS category_name
       FROM subcategories s
       JOIN categories c ON s.category_id = c.category_id
       WHERE LOWER(s.name) = ?`,
      [nameTrimmed]
    );

    if (subRows.length > 0) {
      return res.json({
        category_id: subRows[0].category_id,
        subcategory_id: subRows[0].subcategory_id,
        category_name: subRows[0].category_name,
        subcategory_name: subRows[0].subcategory_name,
      });
    }

    // 🔹 If not found as subcategory, try as category
    const [catRows] = await db.query(
      `SELECT category_id, name AS category_name
       FROM categories
       WHERE LOWER(name) = ?`,
      [nameTrimmed]
    );

    if (catRows.length > 0) {
      return res.json({
        category_id: catRows[0].category_id,
        subcategory_id: null,
        category_name: catRows[0].category_name,
        subcategory_name: null,
      });
    }

    // 🔹 Not found
    res.json(null);
  } catch (err) {
    console.error("Error fetching category/subcategory info:", err);
    res.status(500).json({ error: "Server error" });
  }
};


