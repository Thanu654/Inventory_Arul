import  db  from "../config/db.js";

export const seedCategories = async () => {
  const categories = [
    { name: "Electrical" },
    { name: "Plumbing" },
    { name: "Lighting" },
    { name: "Tools" },
    { name: "Hardware" },
  ];

  for (const cat of categories) {
    await db.query(
      `INSERT INTO categories (name, created_at, updated_at)
       VALUES (?, NOW(), NOW())`,
      [cat.name]
    );
  }

  console.log("✅ Categories Seeded Successfully");
};
