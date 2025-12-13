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
  try {
    const [rows] = await db.query("SELECT id,name,email,status FROM users WHERE role='staff'");
    
    // Get permissions for each staff member
    for (let staff of rows) {
      const [permissions] = await db.query(
        "SELECT page FROM permissions WHERE user_id=? AND can_access=true",
        [staff.id]
      );
      staff.pages = JSON.stringify(permissions.map(p => p.page));
    }
    
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateStaff = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, pages } = req.body;

  try {
    // Check if staff exists
    const [staff] = await db.query("SELECT * FROM users WHERE id=? AND role='staff'", [id]);
    if (!staff.length) return res.status(404).json({ message: "Staff not found" });

    // Check if email is already taken by another user
    const [exist] = await db.query("SELECT * FROM users WHERE email=? AND id!=?", [email, id]);
    if (exist.length) return res.status(400).json({ message: "Email already in use" });

    // Update user data
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      await db.query(
        "UPDATE users SET name=?, email=?, password=? WHERE id=?",
        [name, email, hashed, id]
      );
    } else {
      await db.query(
        "UPDATE users SET name=?, email=? WHERE id=?",
        [name, email, id]
      );
    }

    // Update permissions - delete old ones and insert new ones
    await db.query("DELETE FROM permissions WHERE user_id=?", [id]);
    
    for (let page of pages) {
      await db.query(
        "INSERT INTO permissions (user_id, page, can_access) VALUES (?,?,?)",
        [id, page, true]
      );
    }

    res.json({ message: "Staff updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteStaff = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if staff exists
    const [staff] = await db.query("SELECT * FROM users WHERE id=? AND role='staff'", [id]);
    if (!staff.length) return res.status(404).json({ message: "Staff not found" });

    // Delete permissions first (foreign key constraint)
    await db.query("DELETE FROM permissions WHERE user_id=?", [id]);
    
    // Delete staff
    await db.query("DELETE FROM users WHERE id=?", [id]);

    res.json({ message: "Staff deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
