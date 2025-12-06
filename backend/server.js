import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import db from "./config/db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ 
      status: "OK", 
      message: "Server is running",
      database: "MySQL Connected" 
    });
  } catch (error) {
    res.status(500).json({ 
      status: "ERROR", 
      message: "Server is running but database connection failed",
      database: "Disconnected",
      error: error.message
    });
  }
});

// API routes
app.use("/api", inventoryRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!", error: err.message });
});

// Test database connection on startup
async function testDatabaseConnection() {
  try {
    await db.query("SELECT 1");
    console.log("✅ MySQL database connected successfully");
    
    // Test if inventory_db exists
    try {
      await db.query("USE inventory_db");
      console.log("✅ Database 'inventory_db' found");
    } catch (dbError) {
      console.log("⚠️  Database 'inventory_db' not found. Please create it using phpMyAdmin.");
      console.log("SQL to run in phpMyAdmin:");
      console.log("CREATE DATABASE IF NOT EXISTS inventory_db;");
    }
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log("🔧 Please check your MySQL credentials in the .env file");
      console.log("Current settings:");
      console.log(`DB_HOST=${process.env.DB_HOST}`);
      console.log(`DB_USER=${process.env.DB_USER}`);
      console.log(`DB_NAME=${process.env.DB_NAME}`);
    }
  }
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  testDatabaseConnection();
});
