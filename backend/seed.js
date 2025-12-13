import { seedCategories } from "./seeders/categorySeeder.js";
import { seedItems } from "./seeders/itemSeeder.js";
import  db  from "./config/db.js";

const runSeeders = async () => {
  try {
    console.log("🧹 Clearing old data...");

    await db.query("SET FOREIGN_KEY_CHECKS = 0");
    await db.query("TRUNCATE TABLE items");
    await db.query("TRUNCATE TABLE categories");
    await db.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("✅ Tables cleared");

    await seedCategories();
    await seedItems();

    console.log("✅ All Seeders Finished Successfully");
    process.exit();
  } catch (error) {
    console.error("❌ Seeder Error:", error);
    process.exit(1);
  }
};

runSeeders();
