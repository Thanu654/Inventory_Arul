import db from "../config/db.js";
import bcrypt from "bcryptjs";

export const addStaff = async (req, res) => {
  const { name, email, password, pages } = req.body;

  try {
    const [exist] = await db.query("SELECT * FROM users WHERE email=?", [email]);
    if (exist.length) return res.status(400).json({ message: "Staff already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      "INSERT INTO users (name,email,password,role,status) VALUES (?,?,?,?,?)",
      [name, email, hashed, "staff", "active"]
    );

    const staffId = result.insertId;

    // Insert permissions
    for (let page of pages) {
      await db.query(
        "INSERT INTO permissions (user_id,page,can_access) VALUES (?,?,?)",
        [staffId, page, true]
      );
    }

    res.json({ message: "Staff added successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllStaff = async (req, res) => {
  const [rows] = await db.query("SELECT id,name,email,status FROM users WHERE role='staff'");
  res.json(rows);
};
