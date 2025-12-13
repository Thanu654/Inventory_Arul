import  db  from "../config/db.js";

export const getHomeData = async (req, res) => {
  try {
    // Get all items where subcategory is NULL
    const [items] = await db.query(
      "SELECT * FROM items WHERE subcategory_id IS NULL"
    );

    // Group items by category name
    const categoryMap = {};

    items.forEach((item) => {
      if (!categoryMap[item.category]) {
        categoryMap[item.category] = [];
      }
      categoryMap[item.category].push(item);
    });

    // Convert to array format: [{ category: "Electronics", products: [...] }, ...]
    const result = Object.keys(categoryMap).map((catName) => ({
      category: catName,
      products: categoryMap[catName],
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};