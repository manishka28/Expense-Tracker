import { db } from "../config/db.js";

export const getCategoriesByUser = async (userId) => {
  // Fetch categories where user_id = given userId OR user_id IS NULL
  const [categories] = await db.query(
    "SELECT category_id, name FROM categories",
    [userId]
  );
  // console.log(categories);
  

  const categoriesWithSubs = await Promise.all(
    categories.map(async (cat) => {
      const [subs] = await db.query(
        "SELECT subcategory_id, name FROM subcategories WHERE category_id = ?",
        [cat.category_id]
      );
      return { ...cat, subcategories: subs };
    })
  );

  return categoriesWithSubs;
};

