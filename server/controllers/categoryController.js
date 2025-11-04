import { getCategoriesByUser } from "../models/categoryModel.js";

export const fetchCategories = async (req, res) => {
  const { userId } = req.params;
  try {
    const categories = await getCategoriesByUser(userId);
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
