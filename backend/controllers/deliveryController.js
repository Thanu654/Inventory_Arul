import db from "../config/db.js";
import { deleteImageFile } from "../config/upload.js";

export const getDeliveryPrices = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM country_price_conditions ORDER BY country_name, min_weight");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching delivery prices:", error);
    res.status(500).json({ message: "Database Error", error: error.message });
  }
};

export const getDeliveryById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM country_price_conditions WHERE id = ?", [parseInt(id)]);
    if (rows.length === 0) return res.status(404).json({ message: "Entry not found" });
    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching delivery entry:", error);
    res.status(500).json({ message: "Database Error", error: error.message });
  }
};

export const createDelivery = async (req, res) => {
  try {
    const {
      country_name,
      min_weight,
      max_weight,
      normal_price,
      offer_price,
      delivery_min_days,
      delivery_max_days,
      delivery_through,
      delivery_type
    } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    if (!country_name || min_weight === undefined || max_weight === undefined || normal_price === undefined) {
      return res.status(400).json({ message: "country_name, min_weight, max_weight and normal_price are required" });
    }

    const [result] = await db.query(
      `INSERT INTO country_price_conditions (
         country_name, image, min_weight, max_weight, normal_price, offer_price,
         delivery_min_days, delivery_max_days, delivery_through, delivery_type, created_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        country_name,
        imagePath,
        parseFloat(min_weight),
        parseFloat(max_weight),
        parseFloat(normal_price),
        offer_price ? parseFloat(offer_price) : null,
        delivery_min_days !== undefined && delivery_min_days !== '' ? parseInt(delivery_min_days) : null,
        delivery_max_days !== undefined && delivery_max_days !== '' ? parseInt(delivery_max_days) : null,
        delivery_through || null,
        delivery_type || null
      ]
    );

    res.status(201).json({ message: "Delivery entry created", id: result.insertId });
  } catch (error) {
    console.error("Error creating delivery entry:", error);
    res.status(500).json({ message: "Database Error", error: error.message });
  }
};

export const updateDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      country_name,
      min_weight,
      max_weight,
      normal_price,
      offer_price,
      delivery_min_days,
      delivery_max_days,
      delivery_through,
      delivery_type
    } = req.body;
    const newImagePath = req.file ? `/uploads/${req.file.filename}` : null;

    // Check exists (fetch full row for fallbacks)
    const [existing] = await db.query("SELECT * FROM country_price_conditions WHERE id = ?", [parseInt(id)]);
    if (existing.length === 0) return res.status(404).json({ message: "Entry not found" });

    // Delete old image if new provided
    if (newImagePath && existing[0].image) {
      deleteImageFile(existing[0].image);
    }

    const updateQuery = `UPDATE country_price_conditions
                         SET country_name = ?, image = COALESCE(?, image), min_weight = ?, max_weight = ?, normal_price = ?, offer_price = ?,
                             delivery_min_days = ?, delivery_max_days = ?, delivery_through = COALESCE(?, delivery_through), delivery_type = COALESCE(?, delivery_type),
                             updated_at = CURRENT_TIMESTAMP
                         WHERE id = ?`;

    const params = [
      country_name || existing[0].country_name,
      newImagePath,
      min_weight !== undefined ? parseFloat(min_weight) : existing[0].min_weight,
      max_weight !== undefined ? parseFloat(max_weight) : existing[0].max_weight,
      normal_price !== undefined ? parseFloat(normal_price) : existing[0].normal_price,
      offer_price !== undefined ? (offer_price !== '' ? parseFloat(offer_price) : null) : existing[0].offer_price,
      delivery_min_days !== undefined && delivery_min_days !== '' ? parseInt(delivery_min_days) : existing[0].delivery_min_days,
      delivery_max_days !== undefined && delivery_max_days !== '' ? parseInt(delivery_max_days) : existing[0].delivery_max_days,
      delivery_through || existing[0].delivery_through,
      delivery_type || existing[0].delivery_type,
      parseInt(id)
    ];

    await db.query(updateQuery, params);
    res.json({ message: "Delivery entry updated" });
  } catch (error) {
    console.error("Error updating delivery entry:", error);
    res.status(500).json({ message: "Database Error", error: error.message });
  }
};

export const deleteDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db.query("SELECT image FROM country_price_conditions WHERE id = ?", [parseInt(id)]);
    if (existing.length === 0) return res.status(404).json({ message: "Entry not found" });

    await db.query("DELETE FROM country_price_conditions WHERE id = ?", [parseInt(id)]);

    if (existing[0].image) deleteImageFile(existing[0].image);

    res.json({ message: "Delivery entry deleted" });
  } catch (error) {
    console.error("Error deleting delivery entry:", error);
    res.status(500).json({ message: "Database Error", error: error.message });
  }
};

export default {
  getDeliveryPrices,
  getDeliveryById,
  createDelivery,
  updateDelivery,
  deleteDelivery
};
